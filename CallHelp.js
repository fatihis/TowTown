import React, {useState, useEffect, useRef} from 'react';
import {NeuButton} from 'react-native-neu-element';
import firestore, {firebase} from '@react-native-firebase/firestore';
import RBSheet from 'react-native-raw-bottom-sheet';
import auth from '@react-native-firebase/auth';
// import RNLocation from 'react-native-location';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  PermissionsAndroid,
  Modal,
  Picker,
} from 'react-native';
import {convertSpeed, getDistance, MAXLAT} from 'geolib';
import Geolocation from '@react-native-community/geolocation';

const CallHelp = ({navigation}) => {
  const refRBSheet = useRef();
  const [locationLongState, setLocationLongState] = useState(0);
  const [locationLatState, setLocationLatState] = useState(0);
  const [closestTowIdState, setClosestTowIdState] = useState('');
  const [neuButtonColor, setNeuButtonColor] = useState('#eef2f9');
  const [callTowText, setCallTowText] = useState('CALL');
  const [towServiceStatus, setTowServiceStatus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(0);
  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });

    return () => {};
  }, []);

  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });

    return () => {};
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('user-requests')
      .onSnapshot(documentSnapshot => {
        console.log('Tow request data: ', documentSnapshot.docs);

        documentSnapshot.docs.forEach(doc => {
          if (auth().currentUser.uid == doc._data.userUid) {
            if (doc._data.status == false) {
              setCallTowText('CALLING a NEW TOW');
              deleteRequest();
              sendGeoLocation();
            }
          }
        });
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, [towServiceStatus]);

  timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  const deleteRequest = () => {
    var deleteReq = firestore()
      .collection('user-requests')
      .where('userUid', '==', auth().currentUser.uid);
    deleteReq.get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.delete();
      });
    });
  };
  const permissionHandle = async () => {
    console.log(auth().currentUser.uid, 'caller uid');
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });

    console.log(locationLongState);
    console.log(locationLatState);
  };
  getUserDetails = async id => {
    console.log(auth().currentUser.uid);
    const gotUser = await firestore().collection('Users').doc(id).get();
    return gotUser;
  };
  const finalizeRequest = async () => {
    setModalVisible(false);
    firestore()
      .collection('user-requests')
      .doc(closestTowIdState)
      .update({
        done: true,
        score: selectedValue,
      })
      .then(() => {
        console.log('Service done Score:', selectedValue);
      });
    firestore()
      .collection('Users')
      .doc(closestTowIdState)
      .get()
      .then(a => {
        var newScore = (parseInt(selectedValue) + parseInt(a.data().score)) / 2;

        firestore()
          .collection('Users')
          .doc(closestTowIdState)
          .update({
            score: newScore,
          })
          .then(() => {
            console.log('New Tow Driver Score:', newScore);
          });
        setNeuButtonColor('#ffffff');
        setCallTowText('Call New Tow');
        refRBSheet.current.close();
      })
      .catch(e => {
        console.log(e, ':HATA');
      });
  };

  const sendGeoLocation = () => {
    permissionHandle();
    setNeuButtonColor('#eb4034');
    setCallTowText('Calling...');
    const yourGeoPoint = new firestore.GeoPoint(
      locationLatState,
      locationLongState,
    );
    console.log(yourGeoPoint);
    firestore()
      .collection('Tow-service')
      .get()
      .then(querySnapshot => {
        console.log('Total Tow Active: ', querySnapshot.size);
        var closestTowDistance = 1000000000;
        var closestTowID = '';
        var closestTowScore = 0;
        console.log('______EVALUATING DISTANCE______');
        querySnapshot.forEach(documentSnapshot => {
          if (documentSnapshot.data().status == true) {
            var distance = getDistance(
              {
                latitude: documentSnapshot.data().geoLocation._latitude,
                longitude: documentSnapshot.data().geoLocation._longitude,
              },
              {latitude: locationLatState, longitude: locationLongState},
            );

            console.log('|Distance ', distance, 'M             |');
            // if (distance < closestTowDistance) {
            //   console.log('|-------CLOSER TOW FOUND---------|');
            //   closestTowDistance = distance;
            //   closestTowID = documentSnapshot.id;
            //   console.log(
            //     '|New Closest Tow :',
            //     closestTowDistance,
            //     'M       |',
            //   );
            //   console.log('|--------------------------------|');
            // }
            if (distance < closestTowDistance) {
              if (!(closestTowDistance - distance) < 1000) {
                console.log('|-------CLOSER TOW FOUND---------|');
                closestTowDistance = distance;
                closestTowID = documentSnapshot.id;
                closestTowScore = documentSnapshot.data().score;
                console.log(
                  '|New Closest Tow :',
                  closestTowDistance,
                  'M       |',
                );
                console.log('|--------------------------------|');
              } else {
                if (closestTowScore < documentSnapshot.data().score) {
                  console.log('|-------CLOSER TOW FOUND---------|');
                  closestTowDistance = distance;
                  closestTowID = documentSnapshot.id;
                  closestTowScore = documentSnapshot.data().score;
                  console.log(
                    '|New Closest Tow :',
                    closestTowDistance,
                    'M       |',
                  );
                  console.log('|--------------------------------|');
                }
              }
            }
          }
        });
        console.log('|________________________________|');
        setClosestTowIdState(closestTowID);
        console.log('Closest Tow ID', closestTowID, '!');
        if (closestTowIdState != '') {
          sendTowRequest(closestTowID, yourGeoPoint);
          setCallTowText('On it s way');
          alert('Your location and contact info sent to nearest tow.');
        } else {
          console.log('Trying to reconnect to the server...');
          timeout(300).then(() => {
            sendTowRequest(closestTowID, yourGeoPoint);
            setCallTowText('On it s way');
            setTowServiceStatus(true);
            refRBSheet.current.open();
          });
        }
      });
  };

  const sendTowRequest = (closestTowID, yourGeoPoint) => {
    console.log('Sending Request to Server...');
    firestore()
      .collection('user-requests')
      .doc(closestTowID)
      .set({
        userUid: auth().currentUser.uid,
        userGeoLocation: yourGeoPoint,
        towUid: closestTowID,
        status: true,
        done: false,
        score: 0,
      })
      .then(() => {
        console.log('!!!Request sent!!!');
      });
    // firestore()
    //   .collection('user-requests')
    //   .doc(closestTowID)
    //   .add({
    //     userUid: auth().currentUser.uid,
    //     userGeoLocation: yourGeoPoint,
    //     towUid: closestTowID,
    //     status: true,
    //   })
    //   .then(() => {
    //     console.log('!!!Request sent!!!');
    //   });
  };
  const openScoreModal = () => {
    setModalVisible(true);
  };
  const goToProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <TouchableOpacity
        style={{
          height: 50,
          width: 100,
          borderRadius: 20,
          position: 'absolute',
          top: 5,
          right: 5,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#b8b6b6',
        }}
        onPress={() => goToProfile()}>
        <Text style={{fontSize: 20}}>Profile</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.container}>
            <Picker
              selectedValue={selectedValue}
              style={{height: 50, width: 150}}
              onValueChange={(itemValue, itemIndex) =>
                setSelectedValue(itemValue)
              }>
              <Picker.Item label="0" value="0" />
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
            </Picker>
          </View>
          <TouchableOpacity onPress={() => finalizeRequest()}>
            <Text style={styles.textStyle}>Send Score</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <NeuButton
        color={neuButtonColor}
        width={200}
        height={200}
        borderRadius={16}
        onPress={sendGeoLocation}
        isConvex
        style={{marginRight: 30}}>
        <Text style={{fontSize: 22}}>{callTowText}</Text>
      </NeuButton>

      {/* <Button title="Call TOW" onPress={sendGeoLocation} /> */}
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: 'transparent',
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
        }}>
        <Text style={styles.statusOngoing}>Status: On going</Text>
        <NeuButton
          color={'#b5b5b5'}
          width={100}
          height={50}
          borderRadius={16}
          onPress={() => openScoreModal()}
          isConvex
          style={{marginRight: 30}}>
          <Text style={{fontSize: 22}}>Finish</Text>
        </NeuButton>
      </RBSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  centeredView: {
    alignSelf: 'center',
    marginTop: 200,
  },
  textStyle: {
    fontSize: 15,
  },

  button: {
    height: '100%',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  statusOngoing: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default CallHelp;
