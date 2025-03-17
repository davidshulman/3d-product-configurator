import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 3),
  },
  logo: {
    height: 40,
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function Header() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="3D Configurator"
              className={classes.logo}
            />
            <Typography variant="h6" className={classes.title}>
              3D Product Configurator
            </Typography>
          </div>
          <div className={classes.rightSection}>
            <Typography variant="subtitle1">
              Customize Your Products in 3D SIG Team
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header; 