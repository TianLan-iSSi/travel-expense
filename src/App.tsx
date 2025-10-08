import TravelExpenseForm from "./components/TravelExpenseForm";
import TravelNotificationForm from "./components/TravelNotificationForm";
import PendingApprovalForm from "./components/PendingApprovalForm";
import InvoiceCreateRequestForm from "./components/InvoiceCreateRequestForm";

import { Container } from "react-bootstrap";

function App() {
  return (
    <Container className="py-5" style={{ maxWidth: "1200px" }}>
      <TravelNotificationForm />
      <TravelExpenseForm />
      <PendingApprovalForm />
      <InvoiceCreateRequestForm />
    </Container>
  );
}

export default App;
