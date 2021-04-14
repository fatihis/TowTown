import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Login({navigation}) {
  const [emailString, setEmailString] = useState();
  const [passwordString, setpasswordString] = useState();
  const [userTypeString, setuserTypeString] = useState('towDriver');
  const [currentUid, setCurrentUid] = useState();
  onPressSignUp = () =>
    auth()
      .createUserWithEmailAndPassword(emailString, passwordString)
      .then(() => {
        const uidGet = auth().currentUser.uid;
        setCurrentUid(uidGet);
        console.log(uidGet);

        firestore().collection('Users').doc(uidGet).set({
          uid: uidGet,
          email: emailString,
          userType: userTypeString,
        });
        alert('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Bu email adresi zaten kullanılıyor');
        }

        if (error.code === 'auth/invalid-email') {
          alert('Lütfen geçerli bir email adresi yazın');
        }
        if (error.code === 'auth/weak-password') {
          alert('Parolanız zayıf!');
        }

        console.error(error);
      });

  onChangeEmail = text => {
    setEmailString(text);
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

        <Button
          style={styles.signUpButton}
          title="Sign Up"
          onPress={onPressSignUp}></Button>
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
  signUpButton: {
    marginHorizontal: '100px',
  },
  input: {
    height: '10%',
    width: '85%',
    borderWidth: 1,
    marginVertical: '7%',
  },
});
