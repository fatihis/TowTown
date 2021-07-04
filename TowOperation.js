import React, {useState, useEffect, useRef} from 'react';

import firestore, {firebase} from '@react-native-firebase/firestore';
// import RNLocation from 'react-native-location';
import RBSheet from 'react-native-raw-bottom-sheet';
import {NeuButton} from 'react-native-neu-element';
import auth from '@react-native-firebase/auth';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Button,
  Text,
  useColorScheme,
  View,
  Dimensions,
  Linking,
} from 'react-native';

import Geolocation from '@react-native-community/geolocation';
import {set} from 'react-native-reanimated';

const TowOperation = ({route, navigation}) => {
  // RNLocation.configure({
  //   distanceFilter: 5.0,
  // });
  //const [style, setStyle] = useState(Object);
  //setStyle(NeuView.propTypes.convex);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [locationLongState, setLocationLongState] = useState(0);
  const [locationLatState, setLocationLatState] = useState(0);
  const [currentTowState, setCurrentTowState] = useState(true);
  const [buttonTitleState, setButtonTitleState] = useState('Ready');
  const [matchedUserInformation, setMatchedUserInformation] = useState();
  const [matchedUserCarTypeText, setMatchedUserCarTypeText] = useState('');
  const [matchedUserPhoneNumber, setMatchedUserPhoneNumber] = useState('');
  const [matchedUserLocation, setMatchedUserLocation] = useState('');
  const [towIdState, setTowIdState] = useState('');
  const [neuButtonColor, setNeuButtonColor] = useState('#eef2f9');
  const [hasAssignment, setHasAssignment] = useState(false);
  const [documentId, setDocumentId] = useState();
  const refRBSheet = useRef();
  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });
    const {towId} = route.params;

    // async function getCurrentUid() {
    //   const currentUserUidConst = await firebase.auth().currentUser.uid;
    //   setTowIdState(currentUserUidConst);
    // }
    // getCurrentUid();

    console.log(towIdState, 'towid');
    const subscriber = firestore()
      .collection('user-requests')
      .onSnapshot(documentSnapshot => {
        console.log('Tow request data: ', documentSnapshot.docs);

        documentSnapshot.docs.forEach(doc => {
          if (doc._data.towUid == towId) {
            console.log('it s a match!', doc._data);

            setMatchedUserLocation(doc._data.userGeoLocation);
            console.log('LOCATION', matchedUserLocation);
            getMatchedUserInfo(doc._data.userUid);
            setDocumentId(doc.id);
            setHasAssignment(true);
            // setMatchedUserCarTypeText(matchedUserInformation.carType);
            if (doc._data.done == true) {
              refRBSheet.current.close();
            }
          }
        });
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);
  const finalizeRequest = () => {
    const {towId} = route.params;
    firestore()
      .collection('Tow-service')
      .doc(towId)
      .set({
        status: true,
      })
      .then(() => {
        console.log('Position Activated');
      })
      .catch(e => {
        console.log(e);
      });
  };
  const getMatchedUserInfo = async matchedUid => {
    const matchedUserInfo = await firestore()
      .collection('Users')
      .doc(matchedUid)
      .get();

    timeout(300).then(() => {
      console.log('Matched User Info:', matchedUserInfo);
      // setMatchedUserInformation(matchedUserInfo.data());
      setMatchedUserPhoneNumber(matchedUserInfo.data().phoneNumber);
      setMatchedUserCarTypeText(matchedUserInfo.data().carType);
    });
    refRBSheet.current.open();
  };

  const towStateHandler = () => {
    const yourGeoPoint = new firestore.GeoPoint(
      locationLatState,
      locationLongState,
    );
    setCurrentTowState(!currentTowState);
    if (currentTowState) {
      setButtonTitleState('You are online.');
      setNeuButtonColor('#009900');
      const {towId} = route.params;
      firestore()
        .collection('Tow-service')
        .doc(towId)
        .set({
          id: towId,
          geoLocation: yourGeoPoint,
          status: true,
        })
        .then(() => {
          console.log('positionActivated');
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      setButtonTitleState('You are offline.');
      setNeuButtonColor('#878787');
      const {towId} = route.params;
      firestore()
        .collection('Tow-service')
        .doc(towId)
        .set({
          id: towId,
          geoLocation: yourGeoPoint,
          status: false,
        })
        .then(() => {
          console.log('positionActivated');
        })
        .catch(e => {
          console.log(e);
        });
    }
  };
  const callPhone = () => {
    Linking.openURL(`tel:${matchedUserPhoneNumber}`);
  };

  timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  const permissionHandle = async () => {
    console.log('here');

    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });

    console.log(locationLongState);
    console.log(locationLatState);
  };

  const sendGeoLocation = () => {
    permissionHandle();
    const yourGeoPoint = new firestore.GeoPoint(
      locationLatState,
      locationLongState,
    );
    console.log(yourGeoPoint);
    const {towId} = route.params;
    towStateHandler();
    // firestore()
    //   .collection('Tow-service')
    //   .doc(towId)
    //   .set({
    //     id: towId,
    //     geoLocation: yourGeoPoint,
    //     status: true,
    //   })
    //   .then(() => {
    //     console.log('positionActivated');
    //   })
    //   .catch(e => {
    //     console.log(e);
    //   });
  };
  const rejectCall = () => {
    console.log('DOCID', auth().currentUser.uid);
    setButtonTitleState('You are offline.');
    setNeuButtonColor('#878787');
    setCurrentTowState(false);
    firestore()
      .collection('Tow-service')
      .doc(auth().currentUser.uid)
      .update({
        status: false,
      })
      .then(() => {
        console.log('Gone offline');
        refRBSheet.current.close();
      });
    firestore()
      .collection('user-requests')
      .doc(auth().currentUser.uid)
      .update({
        status: false,
      })
      .then(() => {
        console.log('Request Rejected');
      });
  };
  const openMaps = () => {
    var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    var url =
      scheme +
      `${matchedUserLocation._latitude},${matchedUserLocation._longitude}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <NeuButton
        color={neuButtonColor}
        width={200}
        height={200}
        borderRadius={16}
        onPress={sendGeoLocation}
        isConvex
        style={{marginRight: 30}}>
        <Text style={{fontSize: 22}}>{buttonTitleState}</Text>
      </NeuButton>

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
        {/* <NeuBorderView
          width={200}
          height={100}
          color={'#eef2f9'}
          borderWidth={10}
          borderRadius={16}>
        </NeuBorderView> */}

        <Text style={styles.informationTextHeader}>Car Information</Text>
        <Text style={styles.informationText}>
          Car Type: {matchedUserCarTypeText}
        </Text>
        <Text style={styles.informationText}>
          Phone Number:{' '}
          <Text style={styles.informationPhone} onPress={() => callPhone()}>
            {matchedUserPhoneNumber}
          </Text>
        </Text>
        <View style={{flex: 1, height: '50%', width: '100%'}}>
          <Button title="Reject" onPress={() => rejectCall()} color="#D53E1E" />
        </View>
        <NeuButton
          color={neuButtonColor}
          width={100}
          height={60}
          borderRadius={16}
          onPress={() => openMaps()}
          isConvex
          style={{marginRight: 30, alignItems: 'center'}}>
          <Text style={{fontSize: 22, textAlign: 'center'}}>Open Maps</Text>
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
  informationTextHeader: {
    fontSize: 30,
    alignSelf: 'center',
  },
  informationText: {
    paddingLeft: 30,
    fontSize: 20,
  },
  informationPhone: {
    fontSize: 20,
    color: 'green',
  },
});

export default TowOperation;
