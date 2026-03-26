import { CHANGE_LANGUAGE_SUCCESS } from '../../type/Translations/translations.types';



export function translation(locale) {
    return { type: CHANGE_LANGUAGE_SUCCESS, locale };
  }