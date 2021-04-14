import React, {useState, useEffect} from 'react';

import firestore, {firebase} from '@react-native-firebase/firestore';
// import RNLocation from 'react-native-location';
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
  const [buttonTitleState, setButtonTitleState] = useState('Ready');

  const [towIdState, setTowIdState] = useState('');
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

    return () => {};
  }, []);
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
    console.log('hey');
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
      <Button title={buttonTitleState} onPress={sendGeoLocation} />
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
