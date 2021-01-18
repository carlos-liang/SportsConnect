import React from 'react'
import app, {fs} from './base.js';

const AuthContext = React.createContext()

class AuthProvider extends React.Component {
  state = {signedIn: false, userData: null}

  constructor() {
    super()
    this.state = {
      signedIn: false,
      userData: null
    }
    app.auth().onAuthStateChanged((currentUser) => {
      this.setState({
        signedIn: !!currentUser,
        userData: currentUser
      });
    }); 
  }

  render() {
    return (
      <AuthContext.Provider
        value={{
            signedIn: this.state.signedIn,
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer

export { AuthProvider, AuthConsumer }
