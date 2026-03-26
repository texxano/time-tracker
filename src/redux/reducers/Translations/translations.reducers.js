import { CHANGE_LANGUAGE_SUCCESS } from '../../type/Translations/translations.types'



export function translationReducer(state = { locale: 'en' }, action = {}) {
  switch (action.type) {
    case CHANGE_LANGUAGE_SUCCESS:
      let language = ""
      if (action.locale === 0) {
        language = "en";
      } else if (action.locale === 100) {
        language = "sq";
      } else if (action.locale === 200) {
        language = "bg";
      } else if (action.locale === 300) {
        language = "hr";
      } else if (action.locale === 400) {
        language = "cs";
      } else if (action.locale === 500) {
        language = "du";
      } else if (action.locale === 600) {
        language = "de";
      } else if (action.locale === 700) {
        language = "el";
      } else if (action.locale === 800) {
        language = "hu";
      } else if (action.locale === 900) {
        language = "mk";
      } else if (action.locale === 1000) {
        language = "ro";
      } else if (action.locale === 1100) {
        language = "sr";
      } else if (action.locale === 1200) {
        language = "sk";
      } else if (action.locale === 1300) {
        language = "sl";
      } else if (action.locale === 1350) {
        language = "sv";
      }else if (action.locale === 1400) {
        language = "tr";
      } else {
        language = "en";
      }
      return { ...state, locale: language };
    default:
      return state;
  }
};