import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { AuthConsumer } from '../../authContext.js'

const PrivateRoute = ({ component: Component, ...rest }) => (
  <AuthConsumer>
    {({ signedIn }) => (
      <Route
        render={props =>
            signedIn ? <Component {...props} /> : <Redirect to='/dashboard' />
        }
        {...rest}
      />
    )}
  </AuthConsumer>
)

export default PrivateRoute
