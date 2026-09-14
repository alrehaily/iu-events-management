import {Button, Checkbox, PasswordInput, SimpleGrid, TextInput} from "@mantine/core";
import {hasLength, isEmail, matchesField, useForm} from "@mantine/form";
import {RegisterAccountRequest} from "../../../../types.ts";
import {useFormErrorResponseHandler} from "../../../../hooks/useFormErrorResponseHandler.tsx";
import {useRegisterAccount} from "../../../../mutations/useRegisterAccount.ts";
import {NavLink, useLocation, useNavigate} from "react-router";
import {t, Trans} from "@lingui/macro";
import classes from "./Register.module.scss";
import {getClientLocale} from "../../../../locales.ts";
import {useEffect} from "react";
import {getUserCurrency} from "../../../../utilites/currency.ts";
import {getConfig} from "../../../../utilites/config.ts";
import {getStoredUtmData, clearStoredUtmData} from "../../../../utilites/utm.ts";
import {IconShieldLock} from "@tabler/icons-react";
import {useIULanguage} from "../../../../context/IULanguageContext";

export const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {t: i18nText} = useIULanguage();

    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            timezone: typeof window !== 'undefined'
                ? Intl.DateTimeFormat().resolvedOptions().timeZone
                : 'UTC',
            locale: getClientLocale(),
            invite_token: '',
            currency_code: getUserCurrency(),
            marketing_opt_in: false,
        },
        validate: {
            password: hasLength({min: 8}, t`Password must be at least 8 characters`),
            password_confirmation: matchesField('password', t`Passwords are not the same`),
            email: isEmail(t`Please check your email is valid`),
        },
    });
    const errorHandler = useFormErrorResponseHandler();
    const mutate = useRegisterAccount();

    const registerUser = (data: RegisterAccountRequest) => {
        const utmData = getStoredUtmData();
        const registrationData = utmData ? {...data, ...utmData} : data;

        mutate.mutate({registerData: registrationData}, {
            onSuccess: () => {
                clearStoredUtmData();
                navigate(`/welcome${location.search}`);
            },
            onError: (error: any) => {
                errorHandler(form, error, error.response?.data?.message);
            },
        });
    }

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('invite_token');

        if (token) {
            form.setFieldValue('invite_token', token);
        }
    }, [location.search]);

    return (
        <>
            <div className={classes.badgeWrapper}>
                <span className={classes.badge}>
                    <IconShieldLock size={14} />
                    {i18nText("organizer_portal_badge", "بوابة المنظمين والمسؤولين")}
                </span>
            </div>

            <header className={classes.header}>
                <h2>{i18nText("reg_org_title", "إنشاء حساب جهة منظمة للفعاليات")}</h2>
                <p>
                    {i18nText("reg_org_desc", "مخصص للكليات والعمادات والجهات واللجان المنظمة بالجامعة.")}{' '}
                    <NavLink to={`/manage/login${location.search}`} style={{fontWeight: 600, color: "var(--iu-green-secondary, #1b754b)"}}>
                        {i18nText("organizer_login_link", "تسجيل الدخول للمنظمين")}
                    </NavLink>
                </p>
            </header>

            <div className={classes.registerCard}>
                <form onSubmit={form.onSubmit((values) => registerUser(values as RegisterAccountRequest))}>

                    <SimpleGrid verticalSpacing={{base: "md", sm: 0}} cols={{base: 1, sm: 2}} mb="md">
                        <TextInput
                            {...form.getInputProps('first_name')}
                            label={t`First Name`}
                            placeholder={t`John`}
                            required
                        />
                        <TextInput
                            {...form.getInputProps('last_name')}
                            label={t`Last Name`}
                            placeholder={t`Smith`}
                        />
                    </SimpleGrid>

                    <TextInput
                        mb={0}
                        {...form.getInputProps('email')}
                        label={t`Email`}
                        placeholder={'organizer@iu.edu.sa'}
                        required
                    />

                    <SimpleGrid verticalSpacing={{base: "md", sm: 0}} cols={{base: 1, sm: 2}} mt="md" mb="md">
                        <PasswordInput
                            {...form.getInputProps('password')}
                            label={t`Password`}
                            placeholder={t`Your password`}
                            required
                        />
                        <PasswordInput
                            {...form.getInputProps('password_confirmation')}
                            label={t`Confirm Password`}
                            placeholder={t`Confirm password`}
                            required
                        />
                    </SimpleGrid>

                    <TextInput
                        style={{display: 'none'}}
                        {...form.getInputProps('timezone')}
                        type="hidden"
                    />

                    <Checkbox
                        mb="md"
                        {...form.getInputProps('marketing_opt_in', {type: 'checkbox'})}
                        label={<Trans>Receive product updates from {getConfig("VITE_APP_NAME", "الجامعة الإسلامية")}.</Trans>}
                    />

                    <Button type="submit" fullWidth disabled={mutate.isPending} loading={mutate.isPending}>
                        {mutate.isPending ? t`Working...` : (form.values.invite_token ? t`Accept invitation` : i18nText("reg_org_submit", "إنشاء حساب جهة منظمة"))}
                    </Button>
                </form>
                <footer>
                    <Trans>
                        By registering you agree to our <NavLink target={'_blank'}
                                                                 to={getConfig("VITE_TOS_URL", "/about") as string}>Terms
                        of Service</NavLink> and <NavLink
                        target={'_blank'}
                        to={getConfig("VITE_PRIVACY_URL", '/about') as string}>Privacy Policy</NavLink>.
                    </Trans>
                </footer>
            </div>

            <div className={classes.bottomPrompt}>
                <span>
                    {i18nText("organizer_attendee_prompt", "هل ترغب بحضور الفعاليات والتسجيل فيها فقط؟")}
                </span>
                <NavLink to={`/register${location.search}`}>
                    {i18nText("reg_attendee_link", "التسجيل من بوابة المستفيدين والزوار ←")}
                </NavLink>
            </div>
        </>
    )
}

export default Register;
