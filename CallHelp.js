import React, {useState, useEffect} from 'react';

import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import RNLocation from 'react-native-location';
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
import {getDistance, MAXLAT} from 'geolib';
import Geolocation from '@react-native-community/geolocation';

const CallHelp = ({navigation}) => {
  // RNLocation.configure({
  //   distanceFilter: 5.0,
  // });
  //const [style, setStyle] = useState(Object);
  //setStyle(NeuView.propTypes.convex);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const [locationLongState, setLocationLongState] = useState(0);
  const [locationLatState, setLocationLatState] = useState(0);
  const [closestTowIdState, setClosestTowIdState] = useState('');

  useEffect(() => {
    Geolocation.getCurrentPosition(info => {
      setLocationLatState(info.coords.latitude),
        setLocationLongState(info.coords.longitude);
    });
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
        console.log('______EVALUATING DISTANCE______');
        querySnapshot.forEach(documentSnapshot => {
          var distance = getDistance(
            {
              latitude: documentSnapshot.data().geoLocation._latitude,
              longitude: documentSnapshot.data().geoLocation._longitude,
            },
            {latitude: locationLatState, longitude: locationLongState},
          );

          console.log('|Distance ', distance, 'M             |');
          if (distance < closestTowDistance) {
            console.log('|-------CLOSER TOW FOUND---------|');
            closestTowDistance = distance;
            closestTowID = documentSnapshot.id;
            console.log('|New Closest Tow :', closestTowDistance, 'M       |');
            console.log('|--------------------------------|');
          }
        });
        console.log('|________________________________|');
        setClosestTowIdState(closestTowID);
        console.log('Closest Tow ID', closestTowIdState);
      });
    console.log('Sending Request to Server...');
    firestore()
      .collection('user-requests')
      .add({
        userUid: auth().currentUser.uid,
        userGeoLocation: yourGeoPoint,
        towUid: closestTowIdState,
      })
      .then(() => {
        console.log('!!!Request sent!!!');
      });
  };

  findNearestDriver = async () => {};
  return (
    <SafeAreaView style={styles.mainContainer}>
      <Button title="Call TOW" onPress={sendGeoLocation} />
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

export default CallHelp;
