import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import {Shadow} from 'react-native-neomorph-shadows';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Login({navigation}) {
  const [emailString, setEmailString] = useState();
  const [passwordString, setpasswordString] = useState();
  const [gotUserType, setGotUserType] = useState('');
  const [gotUserId, setGotUserId] = useState('');

  onChangeEmail = text => {
    setEmailString(text);
  };
  getUserFb = async () => {
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();
    setGotUserType(gotUser.data().userType);
  };
  timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  loginUser = () => {
    auth()
      .signInWithEmailAndPassword(emailString, passwordString)
      .then(() => {
        console.log('Signed in!');
        getUserFb();
        timeout(1000).then(() => {
          if (gotUserType == 'towUser') {
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
  input: {
    height: '10%',
    width: '85%',
    borderWidth: 1,
    marginVertical: '7%',
  },
});
