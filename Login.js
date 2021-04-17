import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import {Shadow} from 'react-native-neomorph-shadows';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Login({navigation}) {
  const [emailString, setEmailString] = useState();
  const [passwordString, setpasswordString] = useState();
  const [gotUserInfo, setGotUserInfo] = useState();
  const [gotUserId, setGotUserId] = useState('');

  onChangeEmail = text => {
    setEmailString(text);
  };

  getUserFb = async () => {
    console.log(auth().currentUser.uid);
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();
    setGotUserInfo(gotUser.data());
    console.log(gotUser);
  };
  timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  loginUser = async () => {
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();
    auth()
      .signInWithEmailAndPassword(emailString, passwordString)
      .then(() => {
        console.log('Signed in!');
        console.log(gotUser._data.userType, 'UT');
        timeout(200).then(() => {
          console.log(gotUser, 'gotted');
          if (gotUser._data.userType === 'towUser') {
            navigation.navigate('CallHelp');
          } else {
            navigation.navigate('TowOperation');
          }
        });
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  };
  loginTest = async (emails, passwords, UT) => {
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();

    auth()
      .signInWithEmailAndPassword(emails, passwords)
      .then(() => {
        console.log('Signed in!');
        console.log(gotUser._data.userType, 'UT');
      });
    timeout(200).then(() => {
      console.log(gotUser);
      if (gotUser._data.userType === 'towUser') {
        navigation.navigate('CallHelp');
      } else {
        navigation.navigate('TowOperation');
      }
    });
  };
  onChangePassword = text => {
    setpasswordString(text);
  };

  return (
    <View style={{height: '100%', width: '100%'}}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={text => onChangeEmail(text)}
          placeholder="Email"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          onChangeText={text => onChangePassword(text)}
          placeholder="Password"
          keyboardType="default"
          secureTextEntry={true}
        />
        <Button title="Login" onPress={loginUser}></Button>
        <Button
          title="user"
          style={styles.testButtons}
          onPress={() =>
            loginTest('isk.fatih1@gmail.com', '123fatih1', 'towUser')
          }></Button>
        <Button
          title="tow"
          style={styles.testButtons}
          onPress={() =>
            loginTest('fatih23psn@gmail.com', '123fatih', 'towDriver')
          }></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: '75%',
    width: '80%',
    borderWidth: 1,
    marginHorizontal: '10%',
    marginTop: '20%',
    alignContent: 'center',
    alignItems: 'center',
  },
  testButtons: {
    marginVertical: 10,
    backgroundColor: 'red',
  },
  input: {
    height: '10%',
    width: '85%',
    borderWidth: 1,
    marginVertical: '7%',
  },
});
