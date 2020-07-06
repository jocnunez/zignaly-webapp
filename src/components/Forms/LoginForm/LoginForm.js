import React, { useState, useEffect, useRef } from "react";
import "./LoginForm.scss";
import { Box, TextField } from "@material-ui/core";
import CustomButton from "../../CustomButton/CustomButton";
import Modal from "../../Modal";
import ForgotPasswordForm from "../ForgotPasswordForm";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { startTradeApiSession } from "../../../store/actions/session";
import { isEmpty } from "lodash";
import { navigate } from "gatsby";
import { setUserExchanges, setUserData } from "../../../store/actions/user";
import Captcha from "../../Captcha";
import PasswordInput from "../../Passwords/PasswordInput";
import { FormattedMessage } from "react-intl";
import useStoreSessionSelector from "../../../hooks/useStoreSessionSelector";
import useStoreUIAsk2FASelector from "../../../hooks/useStoreUIAsk2FASelector";
import TwoFAForm from "../TwoFAForm";
import tradeApi from "../../../services/tradeApiClient";
import { showErrorAlert } from "../../../store/actions/ui";
import { ask2FA } from "../../../store/actions/ui";

/**
 * @typedef {import("../../../store/initialState").DefaultState} DefaultStateType
 * @typedef {import("../../../store/initialState").DefaultStateSession} StateSessionType
 */

const LoginForm = () => {
  const dispatch = useDispatch();
  const [modal, showModal] = useState(false);
  const [is2FAModalOpen, open2FAModal] = useState(false);
  const [loading, showLoading] = useState(false);
  const [gRecaptchaResponse, setCaptchaResponse] = useState("");
  const recaptchaRef = useRef(null);
  const storeSession = useStoreSessionSelector();
  const storeAsk2FA = useStoreUIAsk2FASelector();

  const { handleSubmit, errors, register, setError } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  /**
   * @typedef {Object} LoginFormSubmission
   * @property {string} email
   * @property {string} password
   */

  /**
   * Process data submitted in the login form.
   *
   * @param {LoginFormSubmission} data Submission data.
   * @returns {Void} None.
   */
  const onSubmit = (data) => {
    // setCaptchaResponse("");
    // recaptchaRef.current.reset();

    showLoading(true);

    tradeApi
      .userLogin({ ...data, gRecaptchaResponse })
      .then((responseData) => {
        // Prompt 2FA
        if (responseData.ask2FA) {
          dispatch(ask2FA(true));
        }
        dispatch(startTradeApiSession(responseData));
      })
      .catch((e) => {
        if (e.code === 8) {
          setError("password", "notMatch", "Wrong credentials.");
        } else {
          dispatch(showErrorAlert(e));
        }
      })
      .finally(() => {
        showLoading(false);
      });
  };

  const loadAppUserData = () => {
    if (!isEmpty(storeSession.tradeApi.accessToken) && !storeAsk2FA) {
      const authorizationPayload = {
        token: storeSession.tradeApi.accessToken,
      };

      dispatch(setUserExchanges(authorizationPayload));
      dispatch(setUserData(authorizationPayload));
      navigate("/dashboard/positions");
    }
  };
  useEffect(loadAppUserData, [storeSession.tradeApi.accessToken]);

  const show2FA = () => {
    open2FAModal(storeAsk2FA);
    if (!storeAsk2FA) {
      loadAppUserData();
    }
  };
  useEffect(show2FA, [storeAsk2FA]);

  return (
    <Box
      alignItems="center"
      className="loginForm"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Modal onClose={() => showModal(false)} persist={false} size="small" state={modal}>
        <ForgotPasswordForm />
      </Modal>
      <Modal
        onClose={() => {
          open2FAModal(false);
        }}
        persist={true}
        size="small"
        state={is2FAModalOpen}
      >
        <TwoFAForm />
      </Modal>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          alignItems="start"
          className="inputBox"
          display="flex"
          flexDirection="column"
          justifyContent="start"
        >
          <label className="customLabel">Email address</label>
          <TextField
            className="customInput"
            error={!!errors.email}
            fullWidth
            inputRef={register({
              required: true,
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/,
                message: "Email should be valid",
              },
            })}
            name="email"
            type="email"
            variant="outlined"
          />
          {errors.email && <span className="errorText">{errors.email.message}</span>}
        </Box>

        <Box
          alignItems="start"
          className="inputBox"
          display="flex"
          flexDirection="column"
          justifyContent="start"
        >
          <PasswordInput
            error={!!errors.password}
            inputRef={register({ required: "Password cannot be empty" })}
            label={<FormattedMessage id={"security.password"} />}
            name="password"
          />
          {errors.password && <span className="errorText">{errors.password.message}</span>}
        </Box>

        <Box className="captchaBox">
          <Captcha onChange={setCaptchaResponse} recaptchaRef={recaptchaRef} />
        </Box>

        <Box className="inputBox">
          <CustomButton className={"full submitButton"} loading={loading} type="submit">
            Sign in
          </CustomButton>
        </Box>
        <Box alignItems="center" display="flex" flexDirection="column" justifyContent="center">
          <span className="link" onClick={() => showModal(true)}>
            Forgot password
          </span>
        </Box>
      </form>
    </Box>
  );
};

export default LoginForm;
