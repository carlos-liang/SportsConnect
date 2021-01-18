import React, { Component } from 'react';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { red, blue } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
    secondary: {
      main: red[500],
    },
    tri: {
      main: red[500],
    }
  },
});

class CoreLayout extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Header />
        <div className='main-container'>
          {this.props.children}
        </div>
      </ThemeProvider>
    )
  }

}

export default CoreLayout;
