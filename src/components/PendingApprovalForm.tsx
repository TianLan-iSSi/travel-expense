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
import { FaClipboardCheck } from "react-icons/fa";

interface ApprovalDetails {
  requestId: string;
  requestorName: string;
  client: string;
  project: string;
  amount: number;
  status: string;
  approverName: string;
  comments: string;
}

const PendingApprovalForm = () => {
  const [details, setDetails] = useState<ApprovalDetails>({
    requestId: "",
    requestorName: "",
    client: "",
    project: "",
    amount: 0,
    status: "Pending",
    approverName: "",
    comments: "",
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
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Replace with real backend endpoint
      const res = await fetch("/api/submitApproval", {
        method: "POST",
        body: JSON.stringify(details),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setSuccess(true);
        setDetails({
          requestId: "",
          requestorName: "",
          client: "",
          project: "",
          amount: 0,
          status: "Pending",
          approverName: "",
          comments: "",
        });
      } else throw new Error("Failed to submit approval");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-warning text-dark py-3">
          <h2 className="mb-0 text-center">
            <FaClipboardCheck className="me-2" /> Pending Approval
          </h2>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">Approval decision submitted!</Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="requestId">
                  <Form.Label>Request ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="requestId"
                    value={details.requestId}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
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
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="amount">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={details.amount}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={details.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="approverName">
                  <Form.Label>Approver Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="approverName"
                    value={details.approverName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="comments">
                  <Form.Label>Comments</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="comments"
                    value={details.comments}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button type="submit" variant="warning">
              Submit Decision
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PendingApprovalForm;
