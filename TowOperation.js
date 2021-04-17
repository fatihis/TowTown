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
  const [currentTowState, setCurrentTowState] = useState(false);
  const [buttonTitleState, setButtonTitleState] = useState('Ready');
  const [matchedUserInformation, setMatchedUserInformation] = useState();
  const [matchedUserCarTypeText, setMatchedUserCarTypeText] = useState('');
  const [matchedUserPhoneNumber, setMatchedUserPhoneNumber] = useState('');
  const [matchedUserLocation, setMatchedUserLocation] = useState('');
  const [towIdState, setTowIdState] = useState('');
  const [neuButtonColor, setNeuButtonColor] = useState('#eef2f9');
  const refRBSheet = useRef();
  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });
    async function getCurrentUid() {
      const currentUserUidConst = await firebase.auth().currentUser.uid;
      setTowIdState(currentUserUidConst);
    }
    getCurrentUid();
    const subscriber = firestore()
      .collection('user-requests')
      // .where('towUid', '==', towIdState)
      .onSnapshot(documentSnapshot => {
        console.log('User data: ', documentSnapshot.docs);
        documentSnapshot.docs.forEach(doc => {
          if (doc._data.towUid == towIdState) {
            console.log('it s a match!', doc._data);

            setMatchedUserLocation(doc._data.userGeoLocation);
            getMatchedUserInfo(doc._data.userUid);
            // setMatchedUserCarTypeText(matchedUserInformation.carType);
          }
        });
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);
  const getMatchedUserInfo = async matchedUid => {
    const matchedUserInfo = await firestore()
      .collection('Users')
      .doc(matchedUid)
      .get();
    refRBSheet.current.open();
    timeout(300).then(() => {
      console.log(matchedUserInfo, ' gesss');
      // setMatchedUserInformation(matchedUserInfo.data());

      // setMatchedUserCarTypeText(matchedUserInformation.carType);
    });
  };
  const towStateHandler = () => {
    setCurrentTowState(!currentTowState);
    if (currentTowState) {
      setButtonTitleState('You are online.');
      setNeuButtonColor('#009900');
      sendGeoLocation();
      firestore()
        .collection('Users')
        .doc('towIdState')
        .update({
          status: false,
        })
        .then(() => {
          console.log('User updated!');
        });
    } else {
      setButtonTitleState('You are offline.');
      setNeuButtonColor('#878787');
      firestore()
        .collection('Users')
        .doc(towIdState)
        .update({
          status: false,
        })
        .then(() => {
          console.log('User updated!');
        });
    }
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

    firestore()
      .collection('Tow-service')
      .doc(towIdState)
      .set({
        id: towIdState,
        geoLocation: yourGeoPoint,
        status: true,
      })
      .then(() => {
        console.log('positionActivated');
      })
      .catch(e => {
        console.log(e);
      });
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
        <Text>Car Information</Text>
        {/* <Text>{matchedUserCarTypeText}</Text> */}
        {/* <NeuSpinner
          color="#eef2f9"
          size={50}
          indicatorColor="#aaffc3" // Mint
          duration={1000}
        /> */}
        {/* <Text>{{matchedUserLocation._longitutde}}</Text> */}
        {/* <Text>{matchedUserPhoneNumber}</Text> */}
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
});

export default TowOperation;
