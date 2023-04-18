import {render} from "preact";
import {Counter} from "./Counter"
import {ApolloClient, InMemoryCache, ApolloProvider, gql} from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3030/graphql",
  cache: new InMemoryCache(),
});

render(
  <ApolloProvider client={client}>
    <Counter />
  </ApolloProvider>,
  document.getElementById("count") as HTMLElement
);
