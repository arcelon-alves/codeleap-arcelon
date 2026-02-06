import { FormEvent, useState } from "react";

type SignupScreenProps = {
  onSubmitUsername: (username: string) => void;
};

function SignupScreen({ onSubmitUsername }: SignupScreenProps) {
  const [username, setUsername] = useState("");
  const canSubmit = username.trim().length > 0;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    onSubmitUsername(username.trim());
  }

  return (
    <main className="page page-center">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h1 className="title-large">Welcome to CodeLeap network!</h1>
        <label htmlFor="username" className="label">
          Please enter your username
        </label>
        <input
          id="username"
          className="input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="John doe"
          autoComplete="off"
        />
        <div className="actions-end">
          <button
            type="submit"
            className="button button-primary"
            disabled={!canSubmit}
          >
            ENTER
          </button>
        </div>
      </form>
    </main>
  );
}

export default SignupScreen;
