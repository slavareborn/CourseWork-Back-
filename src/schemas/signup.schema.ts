import * as Yup from 'yup';

const containsNameOrEmail = (password: string, name: string, email: string) => {
  const loweredPassword = password.toLowerCase();
  return (
    loweredPassword.includes(name.toLowerCase()) ||
    loweredPassword.includes(email.toLowerCase())
  );
};

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("Ім'я обов'язкове")
    .matches(/^[А-Яа-яЇїІіЄєҐґ\s-]+$/, 'Тільки кирилиця, пробіли і дефіси')
    .min(2, "Ім'я має містити принаймні два символи")
    .max(45, "Ім'я може бути не більше 45 символів"),

  lastName: Yup.string()
    .required("Прізвище обов'язкове")
    .matches(/^[А-Яа-яЇїІіЄєҐґ\s-]+$/, 'Тільки кирилиця, пробіли і дефіси')
    .min(2, 'Прізвище має містити принаймні два символи')
    .max(45, 'Прізвище може бути не більше 45 символів'),

  phone: Yup.string()
    .required("Телефон обов'язковий")
    .transform((value) => value.replace(/[^+\d]/g, '')) // залишає + та цифри
    .matches(/^\+380\d{9}$/, 'Телефон має бути у форматі +380XXXXXXXXX'),

  password: Yup.string()
    .required("Пароль обов'язковий")
    .min(6, 'Пароль має містити принаймні 6 символів')
    .max(100, 'Пароль може бути не більше 100 символів')
    .matches(
      /^(?=.*[A-Z])(?=.*\d).+$/,
      'Пароль має містити хоча б одну велику літеру та одну цифру',
    )
    .test(
      'no-name-email',
      'Пароль не повинен містити ім’я, прізвище, або електронну пошту',
      function (value) {
        const { firstName, lastName, email } = this.parent;
        return (
          !containsNameOrEmail(value, firstName, email) &&
          !containsNameOrEmail(value, lastName, email)
        );
      },
    ),
});
