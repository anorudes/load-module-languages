import localeStore from 'utils/localeStore';
import { Config } from 'config';
const Counterpart = require('counterpart').Instance;
const { LANGUAGES } = Config.getMainConfig();

const getCounterpart = () => {
  return new Counterpart();
};

const registerTranslations = (Language, lang, componentLocales) => {
  Language.registerTranslations(lang, componentLocales);
};

const setLocale = (Language, lang) =>
  Language.setLocale(lang);

export const checkAndChangeLocale = (Language) => {
  if (global.language && Language._registry.locale !== global.language) {
    setLocale(Language, global.language);
  }
};

// Loading languages packs for modules. (project depended)
export default function (reqContext) {
  const Language = getCounterpart();
  const componentLocales = {};

  // default languages pack
  LANGUAGES.map(lang => {
    componentLocales[lang] = reqContext(`./${lang}.json`);
    registerTranslations(Language, lang, componentLocales[lang]);
  });

  // project specific languages pack
  const updateLocale = () => {
    const projectName = Config.getProjectConfig().projectName;

    if (!projectName) return false;

    LANGUAGES.map(lang => {
      // Common locale

      let projectLocale = {};

      try {
        if (reqContext.resolve) {
          reqContext.resolve(`./${lang}_${projectName}.json`);
        }

        projectLocale = reqContext(`./${lang}_${projectName}.json`);

        registerTranslations(Language, lang, {
          ...componentLocales[lang],
          ...projectLocale,
        });
      } catch (e) { }
    });
  };

  updateLocale();

  localeStore.subscribe(updateLocale);

  return Language;
}
