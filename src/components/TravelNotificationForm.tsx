import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Container,
} from "react-bootstrap";
import { FaBell } from "react-icons/fa";

interface NotificationDetails {
  fullName: string;
  email: string;
  startDate: string;
  endDate: string;
  dateDuration: number;
  travelLocation: string;
  client: string;
  project: string;
  pmo: string;
  resourceType: string;
  additionalInfo: string;
}

const TravelNotificationForm = () => {
  const [tripDetails, setTripDetails] = useState<NotificationDetails>({
    fullName: "",
    email: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    dateDuration: 1,
    travelLocation: "",
    client: "",
    project: "",
    pmo: "",
    resourceType: "",
    additionalInfo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [invoiceNum, setInvoiceNum] = useState<string>("");

  // Validation states
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
    startDate: false,
    endDate: false,
    travelLocation: false,
    client: false,
    project: false,
    pmo: false,
    resourceType: false,
  });

  useEffect(() => {
    if (tripDetails.startDate && tripDetails.endDate) {
      const start = new Date(tripDetails.startDate);
      const end = new Date(tripDetails.endDate);
      const diff = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      setTripDetails((prev) => ({ ...prev, dateDuration: diff }));
    }
  }, [tripDetails.startDate, tripDetails.endDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTripDetails((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
    setError("");
  };

  const validateDetails = () => {
    const startDate = new Date(tripDetails.startDate);
    const endDate = new Date(tripDetails.endDate);

    const errors = {
      fullName: !tripDetails.fullName.trim(),
      email:
        !tripDetails.email.trim() || !/^\S+@\S+\.\S+$/.test(tripDetails.email),
      startDate: !tripDetails.startDate,
      endDate: !tripDetails.endDate || endDate < startDate,
      travelLocation: !tripDetails.travelLocation.trim(),
      client: !tripDetails.client,
      project: !tripDetails.project.trim(),
      pmo: !tripDetails.pmo,
      resourceType: !tripDetails.resourceType,
    };

    setFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError("Please check your entries.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!validateDetails()) {
      setError("");
      return;
    } else {
      try {
        const scriptUrl =
          "https://script.google.com/macros/s/AKfycbyAIuKJsUWn8vSDY634-wOd4WoSnYj06nxYcDBNns7jRapwm1muLlR8QHovDRn53bl9/exec";

        const nameInitial = tripDetails.fullName
          .split(" ")
          .filter((word) => word.length > 0)
          .map((word) => word[0].toUpperCase())
          .join("");

        let invoiceDatePart = "";
        const startDate = new Date(tripDetails.startDate);

        if (startDate) {
          const yy = String(startDate.getFullYear()).slice(-2);
          const mm = String(startDate.getMonth() + 1).padStart(2, "0");
          const dd = String(startDate.getDate()).padStart(2, "0");

          invoiceDatePart = `${yy}${mm}${dd}`;
        }

        const newInvoiceNum = `iSSi-EXP-${tripDetails.client}-${nameInitial}-${invoiceDatePart}`;
        setInvoiceNum(newInvoiceNum);

        const formData = {
          fullName: tripDetails.fullName,
          nameInitial: nameInitial,
          email: tripDetails.email,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          dateDuration: String(tripDetails.dateDuration),
          travelLocation: tripDetails.travelLocation,
          client: tripDetails.client,
          project: tripDetails.project,
          pmo: tripDetails.pmo,
          resourceType: tripDetails.resourceType,
          additionalInfo: tripDetails.additionalInfo,
          invoiceDatePart: invoiceDatePart,
          newInvoiceNum: newInvoiceNum,
        };

        console.log("Submitting form data:", formData);

        const res = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        });

        const result = await res.json();
        console.log("Response:", result);

        if (result.success) {
          setSuccess(true);
          setTripDetails({
            fullName: "",
            email: "",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            dateDuration: 1,
            travelLocation: "",
            client: "",
            project: "",
            pmo: "",
            resourceType: "",
            additionalInfo: "",
          });
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
        <Card.Header className="bg-info text-white py-3">
          <h2 className="mb-0 text-center">
            <FaBell className="me-2" />
            Travel Notification Form
          </h2>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert
              variant="danger"
              onClose={() => setError("")}
              dismissible
              className="m-3"
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              onClose={() => setSuccess(false)}
              dismissible
              className="m-3"
            >
              Travel expenses submitted successfully! Invoice# {invoiceNum}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="mb-4 p-4 bg-white shadow-sm rounded-3 border border-light">
              <h5 className="mb-3 text-primary fw-semibold border-bottom pb-2">
                Personal Information
              </h5>
              <Row className="g-4">
                <Col md={4}>
                  <Form.Group controlId="fullName">
                    <Form.Label className="fw-medium text-muted small">
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={tripDetails.fullName}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.fullName ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.fullName && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group controlId="email">
                    <Form.Label className="fw-medium text-muted small">
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={tripDetails.email}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.email ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback small">
                        {tripDetails.email.trim()
                          ? "Invalid email"
                          : "Required field"}
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group controlId="resourceType">
                    <Form.Label className="fw-medium text-muted small">
                      Resource Type
                    </Form.Label>
                    <Form.Select
                      name="resourceType"
                      value={tripDetails.resourceType}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.resourceType ? "is-invalid" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        -- Select Type --
                      </option>
                      <option value="Employee">Employee</option>
                      <option value="Consultant">Consultant</option>
                    </Form.Select>
                    {formErrors.resourceType && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Trip Details Section */}
            <div className="mb-4 p-4 bg-white shadow-sm rounded-3 border border-light">
              <h5 className="mb-4 text-primary fw-semibold border-bottom pb-2">
                Trip Details
              </h5>
              <Row className="g-4">
                <Col md={5}>
                  <Form.Group controlId="startDate">
                    <Form.Label className="fw-medium text-muted small">
                      Start Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={tripDetails.startDate}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.startDate ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.startDate && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group controlId="endDate">
                    <Form.Label className="fw-medium text-muted small">
                      End Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={tripDetails.endDate}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.endDate ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.endDate && (
                      <div className="invalid-feedback small">Invalid date</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group controlId="dateDuration">
                    <Form.Label className="fw-medium text-muted small">
                      Duration (days)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={tripDetails.dateDuration}
                      readOnly
                      className="border-0 bg-light rounded-2 text-center fw-semibold"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-4 mt-1">
                <Col md={6}>
                  <Form.Group controlId="travelLocation">
                    <Form.Label className="fw-medium text-muted small">
                      Travel Location
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="travelLocation"
                      value={tripDetails.travelLocation}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.travelLocation ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.travelLocation && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="project">
                    <Form.Label className="fw-medium text-muted small">
                      Project Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="project"
                      value={tripDetails.project}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.project ? "is-invalid" : ""
                      }`}
                      required
                    />
                    {formErrors.project && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Client Information Section */}
            <div className="mb-4 p-4 bg-white shadow-sm rounded-3 border border-light">
              <h5 className="mb-3 text-primary fw-semibold border-bottom pb-2">
                Client Information
              </h5>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group controlId="client">
                    <Form.Label className="fw-medium text-muted small">
                      Client
                    </Form.Label>
                    <Form.Select
                      name="client"
                      value={tripDetails.client}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.client ? "is-invalid" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        -- Select Client --
                      </option>
                      <option value="AZ">AZ</option>
                      <option value="Beam">Beam</option>
                      <option value="BC Hydro">BC Hydro</option>
                      <option value="BMS">BMS</option>
                      <option value="GSK">GSK</option>
                      <option value="HP Hood">HP Hood</option>
                      <option value="iSSi">iSSi</option>
                      <option value="Just Evotec">Just Evotec</option>
                      <option value="Merck">Merck</option>
                      <option value="Modular">Modular</option>
                      <option value="Motorola">Motorola</option>
                      <option value="PTC">PTC</option>
                      <option value="Resilience">Resilience</option>
                      <option value="Stemcell">Stemcell</option>
                      <option value="ThermoFisher">ThermoFisher</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    {formErrors.client && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="pmo">
                    <Form.Label className="fw-medium text-muted small">
                      PM
                    </Form.Label>
                    <Form.Select
                      name="pmo"
                      value={tripDetails.pmo}
                      onChange={handleChange}
                      className={`border-secondary-subtle rounded-2 ${
                        formErrors.pmo ? "is-invalid" : ""
                      }`}
                      required
                    >
                      <option value="" disabled>
                        -- Select PM --
                      </option>
                      <option value="Adri">Adri Rautenbach</option>
                      <option value="Anthea">Anthea Robinson-Shaw</option>
                      <option value="Darlene">Darlene Henry</option>
                      <option value="Jennifer">Jennifer Lam</option>
                      <option value="Mariki">Mariki Bosman</option>
                      <option value="Mary Ann">Mary Ann Agregado</option>
                      <option value="Nadia">Nadia Rautenbach</option>
                      <option value="Pierre">Pierre Roex</option>
                      <option value="Rachel">Rachel Liao</option>
                      <option value="Rocio">Rocio Phillips</option>
                      <option value="Tai">Tai Chung</option>
                      <option value="Thomas">Thomas Rautenbach</option>
                      <option value="Vicky">Vicky Estrada</option>
                    </Form.Select>
                    {formErrors.pmo && (
                      <div className="invalid-feedback small">
                        Required field
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Additional Information Section */}
            <div className="mb-4 p-4 bg-white shadow-sm rounded-3 border border-light">
              <h5 className="mb-3 text-primary fw-semibold border-bottom pb-2">
                Additional Information
              </h5>
              <Form.Group controlId="additionalInfo">
                <Form.Control
                  as="textarea"
                  name="additionalInfo"
                  value={tripDetails.additionalInfo}
                  onChange={handleChange}
                  className="border-secondary-subtle rounded-2"
                  rows={2}
                  placeholder="Enter any additional notes or details here..."
                />
              </Form.Group>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="bg-light py-3">
          <div className="d-flex justify-content-between">
            <div>
              <Button variant="primary" onClick={handleSubmit}>
                Submit & Notify PMO
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default TravelNotificationForm;
