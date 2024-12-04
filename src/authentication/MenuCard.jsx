import React from "react";
import {Button, ButtonGroup, Card, CardActions, CardContent, SvgIcon, Typography,} from "@material-ui/core";
import {ReactComponent as GoogleLogo} from "../img/google_g_logo.svg";
import "./Menu.css"
import firebase from "firebase";
import {auth} from "../firebase";
import {useHistory} from "react-router-dom"
import {useAuthState} from "react-firebase-hooks/auth";
import {useStyles} from "./Menu.js"
import BrandLogo from "../BrandLogo";

let redirect = false;

// function LoginOnClick() {
//     const history = useHistory();
//     // alert(`${location} redirect here`)
// }

function googleIcon() {
    return (
        <SvgIcon>
            <GoogleLogo/>
        </SvgIcon>
    )
}

function SignIn() {
    const classes = useStyles();
    const history = useHistory();

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then(r => {
            history.push("/")
        }).catch();
    }

    return (
        <Card className={classes.root} variant="contained"
              style={{height: 575}}> {/*Need outline as we remove border in css*/}
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <CardContent className={classes.cardActions}>
                    <BrandLogo/>
                </CardContent>
            </div>

            {/*log in button*/}
            <CardActions className={classes.cardActions}>
                <ButtonGroup>
                    <Button onClick={() => {
                        history.push("./login")
                    }} className={classes.button} style={{marginBottom: -12.5}}>
                        Iniciar Sesion
                    </Button>
                </ButtonGroup>
            </CardActions>

            {/*<CardContent>*/}
            {/*    <Typography className={classes.typography}>*/}
            {/*        or sign in with:*/}
            {/*    </Typography>*/}
            {/*</CardContent>*/}

            {/*sign in with google button*/}
            {/*<CardActions className={classes.cardActions}>*/}
            {/*    <ButtonGroup>*/}
            {/*        <Button startIcon={googleIcon()} onClick={() => {*/}
            {/*            signInWithGoogle()*/}
            {/*        }} aria-label="Sign in with google" className={classes.button}*/}
            {/*                style={{width: 125, marginBottom: 5,}}>*/}
            {/*            Google*/}
            {/*        </Button>*/}
            {/*    </ButtonGroup>*/}
            {/*</CardActions>*/}

            {/*New user text*/}
            <CardContent>
                <Typography className={classes.typography} style={{marginTop: 10}}>
                    ¿Eres Nuevo Usuario?
                </Typography>
            </CardContent>

            {/*Register button*/}
            <CardActions className={classes.cardActions}>
                <ButtonGroup>
                    <Button onClick={() => {
                        history.push("./signup")
                    }} className={classes.button}
                    >
                        Registrate ahora
                    </Button>
                </ButtonGroup>
            </CardActions>
        </Card>
    )

}

function SignOut() {
    const classes = useStyles();
    const history = useHistory();

    return (
        <Card className={classes.root} variant="contained"
              style={{height: 575}}> {/*Need outline as we remove border in css*/}

            <CardContent className={classes.cardActions}>
                <BrandLogo/>
            </CardContent>

            {/*profile button*/}
            <CardActions className={classes.cardActions}>
                <ButtonGroup>
                    <Button onClick={() => {
                        history.push("/Profile")
                    }} className={classes.button}>
                        Perfil
                    </Button>
                </ButtonGroup>
            </CardActions>

            {/*log out button*/}
            <CardActions className={classes.cardActions}>
                <ButtonGroup>
                    <Button onClick={() => {
                        history.push("/logout")
                    }} className={classes.button}>
                        Cerrar Sesion
                    </Button>
                </ButtonGroup>
            </CardActions>
        </Card>
    )

}

const MenuCard = () => {
    const [user, loading, error] = useAuthState(auth);

    return (
        <>
            {!loading ? ((!user) ? <SignIn/> : <SignOut/>) : <></>}
        </>
    )

};

export default MenuCard;