import ExpenseForm from "./components/ExpenseForm";
import { Container } from "react-bootstrap";

function App() {
  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
      <ExpenseForm />
    </Container>
  );
}

export default App;
