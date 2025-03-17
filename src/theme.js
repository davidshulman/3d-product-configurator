import createMuiTheme from "@material-ui/core/styles/createMuiTheme"

const appTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#2e7d32"
    },
    secondary: {
      main: "#4caf50"
    }
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiPaper: {
      rounded: {
        borderRadius: 8,
      },
    },
  }
})
export default appTheme
