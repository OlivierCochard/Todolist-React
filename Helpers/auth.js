export function signIn(username, password) {
    const API_URL = 'http://graphql.unicaen.fr:4000';
    const SIGN_IN = `
      mutation SignIn($login: String!, $password: String!) {
        signIn(login: $login, password: $password)
      }
    `;
  
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SIGN_IN,
        variables: {
          login,
          password,
        },
      }),
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        if (jsonResponse.errors) {
          throw new Error(jsonResponse.errors[0].message);
        }
        return jsonResponse.data.signIn;
    });
}
  