import { useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Container,
} from "react-bootstrap";
import { FaFileInvoiceDollar } from "react-icons/fa";

interface InvoiceRequest {
  requestorName: string;
  email: string;
  invoiceNumber: string;
  client: string;
  project: string;
  totalAmount: number;
  currency: string;
  notes: string;
}

const InvoiceCreateRequestForm = () => {
  const [details, setDetails] = useState<InvoiceRequest>({
    requestorName: "",
    email: "",
    invoiceNumber: "",
    client: "",
    project: "",
    totalAmount: 0,
    currency: "USD",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: name === "totalAmount" ? parseFloat(value) : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with real backend endpoint
      const res = await fetch("/api/submitInvoiceRequest", {
        method: "POST",
        body: JSON.stringify(details),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setSuccess(true);
        setDetails({
          requestorName: "",
          email: "",
          invoiceNumber: "",
          client: "",
          project: "",
          totalAmount: 0,
          currency: "USD",
          notes: "",
        });
      } else throw new Error("Failed to submit invoice request");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-success text-white py-3">
          <h2 className="mb-0 text-center">
            <FaFileInvoiceDollar className="me-2" /> Create Invoice Request
          </h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">Invoice request submitted!</Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="requestorName">
                  <Form.Label>Requestor Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="requestorName"
                    value={details.requestorName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={details.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="invoiceNumber">
                  <Form.Label>Invoice Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoiceNumber"
                    value={details.invoiceNumber}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="currency">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="currency"
                    value={details.currency}
                    onChange={handleChange}
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="client">
                  <Form.Label>Client</Form.Label>
                  <Form.Control
                    type="text"
                    name="client"
                    value={details.client}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="project">
                  <Form.Label>Project</Form.Label>
                  <Form.Control
                    type="text"
                    name="project"
                    value={details.project}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="totalAmount">
                  <Form.Label>Total Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalAmount"
                    value={details.totalAmount}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="notes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={details.notes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="success">
              Submit Invoice Request
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InvoiceCreateRequestForm;
