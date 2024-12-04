import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@material-ui/core";
import { useStyles } from "./Menu";
import { Autocomplete } from "@material-ui/lab";
import firebaseConfig, { auth, storage } from "../firebase";
import firebase from "firebase";
import { Redirect } from "react-router-dom";
import brandLogo from "../img/Logo.png";
import Zoom from '@material-ui/core/Zoom';

function Signup() {
    const classes = useStyles()

    const [emptyValues, setEmptyValues] = useState({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        passwordConfirm: false,
        university: false,
        privacyPolicy: false,
    })

    const [values, setValues] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: "",
        university: "",
        privacyPolicy: false,
    })

    const [pp, setPP] = useState(null)
    const [ppFile, setPPFile] = useState("")
    let ppUrl = "";

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
        setEmptyValues({ ...emptyValues, [prop]: false });
    }
    const handleChangeCheckbox = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.checked });
        setEmptyValues({ ...emptyValues, [prop]: false });
    }

    const handleChangeUni = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.innerHTML });
    }


    // generates random alphanumeric file name of length 25
    const generateFileName = () => {
        let fileName = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < 25; i++) {
            fileName += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return fileName;
    }

    //gets the file extension from the image name
    const getFileExtension = (image) => {
        let fileExtension = '';
        for (let i = image.name.length; i > 0; i--) {
            if (image.name.charAt(i) === '.') {
                fileExtension = image.name.charAt(i) + fileExtension;
                break;
            } else {
                fileExtension = image.name.charAt(i) + fileExtension;
            }
        }
        return fileExtension;
    }

    async function uploadImage(image, firstImage, lastImage) {

        let fileName = generateFileName();

        let fileExtension = getFileExtension(image);

        let storageRef = storage.ref('profilePictures/' + fileName + fileExtension);

        return new Promise(function (resolve, reject) {
            const uploadImg = storageRef.put(image);

            uploadImg.on("state_changed",
                (snapshot) => {
                    console.log("uploading")
                }, (error) => {
                    return reject(error)
                },
                () => {
                    return resolve(uploadImg)
                }
            );
        }).then(async function (uploadImg) {
            await uploadImg.ref.getDownloadURL().then(url => {
                ppUrl = url
            });
        }
        )


    }

    const [currentUser, setCurrentUser] = useState(null);
    const handleSubmit = async () => {

        let anyEmpty = false;

        for (let i in values) {
            if (values[i] === false || values[i] === "") {
                setEmptyValues(prevState => ({ ...prevState, [i]: true }))
                anyEmpty = true
            }
        }

        if (anyEmpty) return;

        try {
            if ((values.email.includes(".ac") || values.email.includes(".edu") || values.email.includes("drept.unibuc.ro")
                || values.email.includes("utcluj.didatec.ro"))) {
                if (values.password === values.passwordConfirm) {
                    const new_user = await firebaseConfig.auth().createUserWithEmailAndPassword(values.email, values.password);
                    await auth.currentUser.updateProfile({ displayName: values.firstName + " " + values.lastName })
                    if (pp != null) {
                        await uploadImage(pp, true, true)
                    }
                    const userid = auth.currentUser.uid;
                    const db = firebase.firestore();
                    await db.collection('users').doc(userid).set({
                        ID: userid,
                        Name: values.firstName,
                        LastName: values.lastName,
                        University: values.university,
                        chatsNo: 0,
                        profilePicture: ppUrl,
                    });
                    if (new_user.user != null) {
                        await new_user.user.sendEmailVerification();
                        alert("Verification email sent.");
                    } else {
                        alert('user null');
                    }
                    setCurrentUser(true);
                } else {
                    throw 'Passwords do not match';
                }
            } else {
                throw 'Email is not a university email!';
            }
        } catch (error) {
            alert(error);
        }

        firebaseConfig.auth().signOut();

    };

    if (currentUser) {
        return <Redirect to="/menu"></Redirect>
    }

    function handleChangeImage() {
        const preview = document.getElementById(`profilePicture`)
        const file = document.querySelector('input[type=file]').files[0]
        const reader = new FileReader();

        reader.addEventListener('load', function () {
            setPPFile(reader.result);
        }, false);

        if (file && file.type.match('image.*')) {
            reader.readAsDataURL(file)
            setPP(file)
        } else {
            alert('Please only upload images');
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" style={{ margin: 30 }}>
            <Grid container variant="contained">
                <Paper style={{ margin: "auto" }}> {/*Need outline as we remove border in css*/}
                    <Box p={3}>
                        <Box display={"flex"} justifyContent={"center"}>
                            <img src={brandLogo} alt="brand logo" width={40} height={40} />
                            <Typography variant="h2" style={{ fontSize: "35px", marginLeft: "10px" }}>
                                CampusComm
                            </Typography>
                        </Box>


                        <Box style={{ margin: "auto", marginBottom: "10px" }}>
                            <Box display="flex" textAlign="center" alignItems="center" flexDirection={"column"}>
                                <Button
                                    id="upload_button"
                                    variant="text"
                                    component="label"
                                >
                                    <input
                                        id="upload-photo"
                                        name="upload-photo"
                                        type="file"
                                        hidden
                                        onChange={() => {
                                            handleChangeImage()
                                        }}
                                    />
                                    <Box display="flex" textAlign="center" alignItems="center" flexDirection={"column"}>
                                        <Avatar alt="brand logo" className={classes.uploadImage} id="profilePicture"
                                            src={ppFile} style={{ display: "inline-block" }} />
                                        <Typography variant={"body2"} style={{
                                            marginTop: "-32px",
                                            marginBottom: "15px",
                                            zIndex: 5,
                                            color: "#fafafa",
                                            display: "inline-block"
                                        }}>
                                            Edit
                                        </Typography>
                                    </Box>
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    error={emptyValues.firstName}
                                    fullWidth
                                    required
                                    value={values.firstName}
                                    id="First-Name"
                                    label="Nombre"
                                    variant="outlined"
                                    color="primary"
                                    onChange={handleChange("firstName")}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    error={emptyValues.lastName}
                                    fullWidth
                                    required
                                    value={values.lastName}
                                    id="Last-Name"
                                    label="Apellido"
                                    variant="outlined"
                                    color="primary"
                                    onChange={handleChange("lastName")}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            error={emptyValues.email}
                            fullWidth
                            required
                            value={values.email}
                            id="Email"
                            label="Correo electronico academico"
                            variant="outlined"
                            color="primary"
                            style={{ marginTop: 10 }}
                            onChange={handleChange("email")}
                        />
                        <TextField
                            error={emptyValues.password}
                            fullWidth
                            required
                            value={values.password}
                            type="password"
                            id="Password"
                            label="Contraseña"
                            variant="outlined"
                            color="primary"
                            style={{ marginTop: 10 }}
                            onChange={handleChange("password")}
                        />
                        <TextField
                            error={emptyValues.passwordConfirm}
                            fullWidth
                            required
                            type="password"
                            value={values.passwordConfirm}
                            id="Password-Confirm"
                            label="Repite la contraseña"
                            variant="outlined"
                            color="primary"
                            style={{ marginTop: 10 }}
                            onChange={handleChange("passwordConfirm")}
                        />
                        <Autocomplete
                            id="University"
                            options={unis}
                            getOptionLabel={(option) => option.name}
                            style={{ marginTop: 10 }}
                            renderInput={(params) =>
                                <TextField {...params} label="Universidad" variant="outlined"
                                    required
                                    error={emptyValues.university}
                                    value={values.university}
                                    onChange={handleChange("university")} />}
                            onChange={handleChangeUni("university")}

                        />
                        <Box justifyContent="center" alignItems="center" style={{ marginTop: 10 }}>
                            <Button variant="outlined" color="primary"
                                onClick={() => {
                                    handleSubmit()
                                }}
                            >
                                Registrar
                            </Button>
                            <FormControlLabel
                                control={<Checkbox color={"primary"} checked={values.privacyPolicy} onChange={handleChangeCheckbox("privacyPolicy")} />}
                                label={
                                    <>
                                        <Typography style={{ display: "inLine", marginRight: "4px" }} color={emptyValues.privacyPolicy ? "error" : "textSecondary"}>
                                            Estoy de acuerdo con la
                                        </Typography>
                                        <Tooltip TransitionComponent={Zoom} title={"By checking the box you agree to our terms and conditions regarding personal data collection in accordance to the General Data Protection Act. Our team will need your university email account and name. This data will be stored in order to ensure a safe environment for our users when interacting with each other. This data will not be publicly made anywhere else. Other users will have access (be able to see on the platform) your name but nothing else. The email will be available only to us. Please note that if you have any concerns regarding the data collected about yourself, or if you wish to see all data which has been collected about yourself, you can email us at pap36@bath.ac.uk . If you decide to delete your profile, all the data about you will be deleted, but you can also request this personally by mailing us at the above address. Finally, we will delete all data stored about you after the 30th of April 2021 (30.04.2021), unless you specifically ask us to by emailing the above address."} style={{ display: "inLine", textDecoration: 'underline' }}>
                                            <Typography color={emptyValues.privacyPolicy ? "error" : "textSecondary"} >
                                                politica de privacidad
                                            </Typography>
                                        </Tooltip>
                                        <Typography style={{ display: "inLine", marginLeft: "4px" }} color={emptyValues.privacyPolicy ? "error" : "textSecondary"}>
                                            *
                                        </Typography>
                                    </>
                                }
                                style={{ marginLeft: "10px" }}
                                labelPlacement="end"
                            />
                        </Box>
                    </Box>
                </Paper>
            </Grid>
        </Box>
    )
}

const unis = [
    { name: "Universidad de Córdoba" },
]

export default Signup;