(function () {
  const MIN_USERNAME_LENGTH = 4;

  const PASSWORD_RULES = [
    { id: "length", label: "At least 8 characters", message: "Your password must be at least 8 characters long.", test: (value) => value.length >= 8 },
    { id: "upper", label: "An uppercase letter", message: "Your password needs an uppercase letter.", test: (value) => /[A-Z]/.test(value) },
    { id: "lower", label: "A lowercase letter", message: "Your password needs a lowercase letter.", test: (value) => /[a-z]/.test(value) },
    { id: "special", label: "A special symbol, like ! or @", message: "Your password needs a special symbol, like ! or @.", test: (value) => /\W/.test(value) }
  ];

  function firstUnmetPasswordMessage(value) {
    const unmet = PASSWORD_RULES.find((rule) => !rule.test(value || ""));
    return unmet ? unmet.message : "";
  }

  function usernameMessage(value) {
    if (!value || !/^[A-Za-z]/.test(value)) {
      return "Your username must start with a letter.";
    }
    if (value.length < MIN_USERNAME_LENGTH) {
      return `Your username must be at least ${MIN_USERNAME_LENGTH} characters long.`;
    }
    return "";
  }

  function nicknameMessage(value) {
    if (!value) {
      return "";
    }
    return /^[A-Za-z][A-Za-z0-9_-]{2,19}$/.test(value)
      ? ""
      : "Nicknames are 3-20 characters: letters, numbers, - or _, starting with a letter.";
  }

  function confirmationMessage(password, confirmation) {
    return password === confirmation ? "" : "The two passwords don't match.";
  }

  function emailMessage(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "") ? "" : "Please enter a valid email address.";
  }

  const PasswordField = {
    props: {
      modelValue: { type: String, default: "" },
      autocomplete: { type: String, default: "current-password" },
      placeholder: { type: String, default: "" },
      showRules: { type: Boolean, default: false },
      matchWith: { type: String, default: null },
      disabled: { type: Boolean, default: false }
    },
    emits: ["update:modelValue"],
    data() {
      return { visible: false, capsLockOn: false };
    },
    computed: {
      rules() {
        return PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, met: rule.test(this.modelValue) }));
      },
      matchState() {
        if (this.matchWith === null || !this.modelValue) {
          return "";
        }
        return this.modelValue === this.matchWith ? "match" : "mismatch";
      }
    },
    methods: {
      trackCapsLock(event) {
        this.capsLockOn = Boolean(event.getModifierState && event.getModifierState("CapsLock"));
      }
    },
    template: `
      <div class="password-field">
        <div class="password-field__control">
          <input
            :type="visible ? 'text' : 'password'"
            :value="modelValue"
            :autocomplete="autocomplete"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="$emit('update:modelValue', $event.target.value)"
            @keydown="trackCapsLock"
            @keyup="trackCapsLock"
            @blur="capsLockOn = false"
          />
          <button
            type="button"
            class="password-field__toggle"
            :disabled="disabled"
            :aria-label="visible ? 'Hide password' : 'Show password'"
            :aria-pressed="visible"
            @click="visible = !visible"
          >{{ visible ? "Hide" : "Show" }}</button>
        </div>
        <p v-if="capsLockOn" class="password-field__caps">Caps Lock is on</p>
        <p v-if="matchState === 'match'" class="password-field__match">✓ Passwords match</p>
        <p v-else-if="matchState === 'mismatch'" class="password-field__caps">Passwords don't match yet</p>
        <ul v-if="showRules && modelValue" class="password-rules">
          <li v-for="rule in rules" :key="rule.id" :class="{ 'password-rules__item--met': rule.met }">
            {{ rule.met ? "✓" : "•" }} {{ rule.label }}
          </li>
        </ul>
      </div>
    `
  };

  window.Naji = window.Naji || {};
  window.Naji.components = { PasswordField };
  window.Naji.validation = { firstUnmetPasswordMessage, usernameMessage, nicknameMessage, confirmationMessage, emailMessage };
})();
