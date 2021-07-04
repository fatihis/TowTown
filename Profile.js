import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
export default function Profile() {
  const [UserCarTypeText, setUserCarTypeText] = useState('');
  const [UserPhoneNumber, setUserPhoneNumber] = useState('');
  const [UserEmail, setUserEmail] = useState('');
  useEffect(() => {
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get()
      .then(data => {
        console.log(data.data());
        setUserCarTypeText(data.data().carType);
        setUserPhoneNumber(data.data().phoneNumber);
        setUserEmail(data.data().email);
      });
  }, []);
  return (
    <View style={{height: '100%', width: '100%'}}>
      <View
        style={{
          height: '15%',
          width: '60%',
          alignSelf: 'center',

          marginTop: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 20}}>Basic User</Text>
      </View>
      <View
        style={{
          height: '10%',
          width: '60%',
          alignSelf: 'center',
          backgroundColor: '#88a7bf',
          marginTop: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 20}}>Email</Text>
        <Text style={{fontSize: 20}}>{UserEmail}</Text>
      </View>
      <View
        style={{
          height: '10%',
          width: '60%',
          alignSelf: 'center',
          backgroundColor: '#88a7bf',
          marginTop: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 20}}>Phone Number</Text>
        <Text style={{fontSize: 20}}>{UserPhoneNumber}</Text>
      </View>
      <View
        style={{
          height: '10%',
          width: '60%',
          alignSelf: 'center',
          backgroundColor: '#88a7bf',
          marginTop: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 20}}>Car Type</Text>
        <Text style={{fontSize: 20}}>{UserCarTypeText}</Text>
      </View>
      <View
        style={{
          height: '10%',
          width: '60%',
          alignSelf: 'center',

          marginTop: 25,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{fontSize: 10}}>UID:{auth().currentUser.uid}</Text>
      </View>
    </View>
  );
}
