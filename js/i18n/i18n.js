(function () {
  const STORAGE_KEY = "naji.lang";
  const SUPPORTED = ["en", "ar"];
  const RTL_LANGUAGES = ["ar"];
  const TRANSLATED_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"];
  const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA"]);
  const PLACEHOLDER = /\{(\d+)\}/g;

  const dictionaries = {};
  const compiledPatterns = {};
  const translatedNodes = new WeakMap();
  const translatedAttributes = new WeakMap();

  function detectLanguage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) {
      return saved;
    }
    return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
  }

  const language = detectLanguage();
  const isRtl = RTL_LANGUAGES.includes(language);

  document.documentElement.setAttribute("lang", language);
  document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");

  function normalize(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function patternsFor(lang) {
    if (compiledPatterns[lang]) {
      return compiledPatterns[lang];
    }
    const patterns = [];
    Object.keys(dictionaries[lang] || {}).forEach((key) => {
      if (!PLACEHOLDER.test(key)) {
        return;
      }
      PLACEHOLDER.lastIndex = 0;
      const source = key
        .split(PLACEHOLDER)
        .map((part, index) => (index % 2 === 1 ? "(.+?)" : escapeRegExp(part)))
        .join("");
      patterns.push({ key, regex: new RegExp(`^${source}$`), weight: key.replace(PLACEHOLDER, "").length });
    });
    patterns.sort((left, right) => right.weight - left.weight);
    compiledPatterns[lang] = patterns;
    return patterns;
  }

  function translateFragment(fragment) {
    const dictionary = dictionaries[language];
    const key = normalize(fragment);
    return dictionary && Object.prototype.hasOwnProperty.call(dictionary, key) ? dictionary[key] : fragment;
  }

  function lookup(key) {
    const dictionary = dictionaries[language];
    if (!dictionary) {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(dictionary, key)) {
      return dictionary[key];
    }
    for (const pattern of patternsFor(language)) {
      const match = key.match(pattern.regex);
      if (match) {
        return dictionary[pattern.key].replace(PLACEHOLDER, (whole, index) => translateFragment(match[Number(index) + 1]));
      }
    }
    return undefined;
  }

  function translate(text) {
    if (language === "en" || typeof text !== "string") {
      return text;
    }
    const key = normalize(text);
    if (!key) {
      return text;
    }
    const translated = lookup(key);
    if (translated === undefined) {
      return text;
    }
    const leading = text.match(/^\s*/)[0];
    const trailing = text.match(/\s*$/)[0];
    return leading + translated + trailing;
  }

  function translateTextNode(node) {
    const current = node.nodeValue;
    const record = translatedNodes.get(node);
    if (record && record.output === current) {
      return;
    }
    const output = translate(current);
    if (output !== current) {
      translatedNodes.set(node, { output });
      node.nodeValue = output;
    }
  }

  function translateAttributes(element) {
    TRANSLATED_ATTRIBUTES.forEach((name) => {
      if (!element.hasAttribute || !element.hasAttribute(name)) {
        return;
      }
      const current = element.getAttribute(name);
      const records = translatedAttributes.get(element) || {};
      if (records[name] === current) {
        return;
      }
      const output = translate(current);
      if (output !== current) {
        records[name] = output;
        translatedAttributes.set(element, records);
        element.setAttribute(name, output);
      }
    });
  }

  function translateTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      if (!root.parentNode || !SKIPPED_TAGS.has(root.parentNode.nodeName)) {
        translateTextNode(root);
      }
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
      return;
    }
    if (root.nodeType === Node.ELEMENT_NODE) {
      if (SKIPPED_TAGS.has(root.nodeName)) {
        return;
      }
      translateAttributes(root);
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeType === Node.ELEMENT_NODE && SKIPPED_TAGS.has(node.nodeName)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node);
      } else {
        translateAttributes(node);
      }
      node = walker.nextNode();
    }
  }

  function startObserving() {
    translateTree(document);
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(translateTree);
        } else if (mutation.type === "characterData") {
          if (mutation.target.parentNode && !SKIPPED_TAGS.has(mutation.target.parentNode.nodeName)) {
            translateTextNode(mutation.target);
          }
        } else if (mutation.type === "attributes") {
          translateAttributes(mutation.target);
        }
      });
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATED_ATTRIBUTES
    });
  }

  function register(lang, dictionary) {
    dictionaries[lang] = dictionary;
    delete compiledPatterns[lang];
  }

  function setLanguage(lang) {
    if (!SUPPORTED.includes(lang) || lang === language) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, lang);
    window.location.reload();
  }

  function toggleLanguage() {
    setLanguage(language === "ar" ? "en" : "ar");
  }

  window.Naji = window.Naji || {};
  window.Naji.i18n = {
    language,
    isRtl,
    supported: SUPPORTED,
    register,
    setLanguage,
    toggleLanguage,
    t: translate,
    start() {
      if (language !== "en") {
        startObserving();
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => window.Naji.i18n.start());
})();
