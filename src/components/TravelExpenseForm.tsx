import { useState, useEffect } from "react";
import {
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { FaPlane, FaFileUpload } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { set } from "react-datepicker/dist/date_utils";

interface TripExpenseDetails {
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
  expenses: ExpenseItem[];
}

interface ExpenseItem {
  id: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  receiptFile: File | null;
}

const TravelExpenseForm = () => {
  const [tripExpenseDetails, setTripExpenseDetails] =
    useState<TripExpenseDetails>({
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
      expenses: [],
    });

  const [expenseItem, setExpenseItem] = useState<ExpenseItem>({
    id: "",
    expenseDate: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: 0,
    currency: "CAD",
    receiptFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
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

  const [expenseErrors, setExpenseErrors] = useState({
    description: false,
    amount: false,
    category: false,
    date: false,
    currency: false,
    receiptFile: false,
  });

  const expenseCategories = [
    "Flight",
    "Hotel",
    "Car Rental",
    "Train",
    "Taxi",
    "Meals",
    "Other",
  ];

  const currencies = ["USD", "EUR", "GBP", "CAD", "JPY"];

  useEffect(() => {
    if (tripExpenseDetails.startDate && tripExpenseDetails.endDate) {
      const start = new Date(tripExpenseDetails.startDate);
      const end = new Date(tripExpenseDetails.endDate);
      const diff = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      setTripExpenseDetails((prev) => ({ ...prev, dateDuration: diff }));
    }
  }, [tripExpenseDetails.startDate, tripExpenseDetails.endDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTripExpenseDetails((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setFormErrors((prev) => ({ ...prev, [name]: false }));
    setError("");
  };

  const handleExpenseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setExpenseItem((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    setExpenseErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateDetailsTab = () => {
    const startDate = new Date(tripExpenseDetails.startDate);
    const endDate = new Date(tripExpenseDetails.endDate);

    const errors = {
      fullName: !tripExpenseDetails.fullName.trim(),
      email:
        !tripExpenseDetails.email.trim() ||
        !/^\S+@\S+\.\S+$/.test(tripExpenseDetails.email),
      startDate: !tripExpenseDetails.startDate,
      endDate: !tripExpenseDetails.endDate || endDate < startDate,
      travelLocation: !tripExpenseDetails.travelLocation.trim(),
      client: !tripExpenseDetails.client,
      project: !tripExpenseDetails.project.trim(),
      pmo: !tripExpenseDetails.pmo,
      resourceType: !tripExpenseDetails.resourceType,
    };

    setFormErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError("Please check your entries.");
      return false;
    }
    return true;
  };

  const validateExpensesTab = () => {
    if (tripExpenseDetails.expenses.length === 0) {
      setError("Please add at least one tripDetails.");
      return false;
    }
    return true;
  };

  const validateExpensesItem = () => {
    const errors = {
      description: !expenseItem.description.trim(),
      amount: expenseItem.amount <= 0 || isNaN(expenseItem.amount),
      category: !expenseItem.category,
      date: !expenseItem.expenseDate,
      currency: !expenseItem.currency,
      receiptFile: !expenseItem.receiptFile,
    };

    setExpenseErrors(errors);

    if (Object.values(errors).some(Boolean)) {
      setError("Please check your expense item entry.");
      return false;
    }
    return true;
  };

  const handleAddExpense = () => {
    if (!validateExpensesItem()) {
      return;
    }

    const expenseToAdd = {
      ...expenseItem,
      id: Date.now().toString(),
      amount: Math.round(expenseItem.amount * 100) / 100,
    };

    setTripExpenseDetails((prev) => ({
      ...prev,
      expenses: [...prev.expenses, expenseToAdd],
    }));

    setExpenseItem({
      id: "",
      expenseDate: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
      amount: 0,
      currency: "CAD",
      receiptFile: null,
    });
  };

  const handleRemoveExpense = (id: string) => {
    setTripExpenseDetails((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((exp) => exp.id !== id),
    }));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setExpenseItem((prev) => ({ ...prev, receiptFile: e.target.files![0] }));
      setExpenseErrors((prev) => ({ ...prev, receiptFile: false }));
    }
  };

  const handleRemoveReceipt = (expenseId: string) => {
    setTripExpenseDetails((prev) => ({
      ...prev,
      expenses: prev.expenses.map((exp) =>
        exp.id === expenseId ? { ...exp, receiptFile: null } : exp
      ),
    }));
  };

  const handleTabChange = (tab: string) => {
    if (activeTab === "details" && tab !== "details") {
      if (!validateDetailsTab()) {
        return;
      }
      setError("");
    } else if (activeTab === "expenses" && tab !== "expenses") {
      if (!validateExpensesTab()) {
        return;
      }
      setError("");
    }
    setActiveTab(tab);
  };

  const fileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result) {
          const base64 = (reader.result as string).split(",")[1];
          resolve({
            name: file.name,
            type: file.type,
            data: base64,
          });
        } else {
          reject(new Error("Failed to read file: result is null"));
        }
      };

      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const scriptUrl =
        "https://script.google.com/macros/s/AKfycbyAIuKJsUWn8vSDY634-wOd4WoSnYj06nxYcDBNns7jRapwm1muLlR8QHovDRn53bl9/exec";

      // Convert each expense, adding base64 field if receiptFile exists
      const expensesWithReceipts = await Promise.all(
        tripExpenseDetails.expenses.map(async (exp) => {
          if (exp.receiptFile) {
            const base64 = await fileToBase64(exp.receiptFile);
            return {
              ...exp,
              receiptBase64: base64,
            };
          }
          return exp;
        })
      );

      const nameInitial = tripExpenseDetails.fullName
        .split(" ")
        .filter((word) => word.length > 0)
        .map((word) => word[0].toUpperCase())
        .join("");

      let invoiceDatePart = "";
      const startDate = new Date(tripExpenseDetails.startDate);

      if (startDate) {
        const yy = String(startDate.getFullYear()).slice(-2);
        const mm = String(startDate.getMonth() + 1).padStart(2, "0");
        const dd = String(startDate.getDate()).padStart(2, "0");

        invoiceDatePart = `${yy}${mm}${dd}`;
      }

      const newInvoiceNum = `iSSi-EXP-${tripExpenseDetails.client}-${nameInitial}-${invoiceDatePart}`;
      setInvoiceNum(newInvoiceNum);

      const formData = {
        fullName: tripExpenseDetails.fullName,
        nameInitial: nameInitial,
        email: tripExpenseDetails.email,
        startDate: tripExpenseDetails.startDate,
        endDate: tripExpenseDetails.endDate,
        dateDuration: String(tripExpenseDetails.dateDuration),
        travelLocation: tripExpenseDetails.travelLocation,
        client: tripExpenseDetails.client,
        project: tripExpenseDetails.project,
        pmo: tripExpenseDetails.pmo,
        resourceType: tripExpenseDetails.resourceType,
        additionalInfo: tripExpenseDetails.additionalInfo,
        expenses: expensesWithReceipts,
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
        setTripExpenseDetails({
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
          expenses: [],
        });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
        <Card.Header className="bg-primary text-white py-3">
          <h2 className="mb-0 text-center">
            <FaPlane className="me-2" />
            iSSi Travel Expense Report
          </h2>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="d-flex border-bottom">
            <button
              className={`flex-grow-1 py-3 px-4 border-0 bg-transparent ${
                activeTab === "details" ? "fw-bold bg-light" : ""
              }`}
              onClick={() => setActiveTab("details")}
            >
              Trip Details
            </button>
            <button
              className={`flex-grow-1 py-3 px-4 border-0 bg-transparent ${
                activeTab === "expenses" ? "fw-bold bg-light" : ""
              }`}
              onClick={() => handleTabChange("expenses")}
            >
              Expenses
            </button>
          </div>

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

          <div className="p-4">
            {activeTab === "details" && (
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
                          value={tripExpenseDetails.fullName}
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
                          value={tripExpenseDetails.email}
                          onChange={handleChange}
                          className={`border-secondary-subtle rounded-2 ${
                            formErrors.email ? "is-invalid" : ""
                          }`}
                          required
                        />
                        {formErrors.email && (
                          <div className="invalid-feedback small">
                            {tripExpenseDetails.email.trim()
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
                          value={tripExpenseDetails.resourceType}
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
                          value={tripExpenseDetails.startDate}
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
                          value={tripExpenseDetails.endDate}
                          onChange={handleChange}
                          className={`border-secondary-subtle rounded-2 ${
                            formErrors.endDate ? "is-invalid" : ""
                          }`}
                          required
                        />
                        {formErrors.endDate && (
                          <div className="invalid-feedback small">
                            Invalid date
                          </div>
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
                          value={tripExpenseDetails.dateDuration}
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
                          value={tripExpenseDetails.travelLocation}
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
                          value={tripExpenseDetails.project}
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
                          value={tripExpenseDetails.client}
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
                          value={tripExpenseDetails.pmo}
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
                      value={tripExpenseDetails.additionalInfo}
                      onChange={handleChange}
                      className="border-secondary-subtle rounded-2"
                      rows={2}
                      placeholder="Enter any additional notes or details here..."
                    />
                  </Form.Group>
                </div>
              </Form>
            )}

            {activeTab === "expenses" && (
              <div>
                <h5 className="mb-4 text-primary fw-semibold">Expense Items</h5>

                {/* Expense Entry Form */}
                <Card className="mb-4 shadow-sm border-0">
                  <Card.Body>
                    <Row className="g-3">
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Date
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="expenseDate"
                            value={expenseItem.expenseDate}
                            onChange={handleExpenseChange}
                            className={`rounded-2 ${
                              expenseErrors.date ? "is-invalid" : ""
                            }`}
                          />
                          {expenseErrors.date && (
                            <div className="invalid-feedback">Required</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={2}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Category
                          </Form.Label>
                          <Form.Select
                            name="category"
                            value={expenseItem.category}
                            onChange={handleExpenseChange}
                            className={`rounded-2 ${
                              expenseErrors.category ? "is-invalid" : ""
                            }`}
                          >
                            <option value="" disabled>
                              -- Select --
                            </option>
                            {expenseCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </Form.Select>
                          {expenseErrors.category && (
                            <div className="invalid-feedback">Required</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Description
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="description"
                            value={expenseItem.description}
                            onChange={handleExpenseChange}
                            className={`rounded-2 ${
                              expenseErrors.description ? "is-invalid" : ""
                            }`}
                            placeholder="e.g., Taxi to airport"
                          />
                          {expenseErrors.description && (
                            <div className="invalid-feedback">Required</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={1}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Amount
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="amount"
                            value={
                              expenseItem.amount === 0 ? "" : expenseItem.amount
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              const numericValue =
                                rawValue === "" ? 0 : parseFloat(rawValue);
                              handleExpenseChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  name: "amount",
                                  value: numericValue.toString(),
                                },
                              });
                            }}
                            min="0"
                            step="0.01"
                            className={`rounded-2 ${
                              expenseErrors.amount ? "is-invalid" : ""
                            }`}
                          />
                          {expenseErrors.amount && (
                            <div className="invalid-feedback">Required</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={1}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Currency
                          </Form.Label>
                          <Form.Select
                            name="currency"
                            value={expenseItem.currency}
                            onChange={handleExpenseChange}
                            className={`rounded-2 ${
                              expenseErrors.currency ? "is-invalid" : ""
                            }`}
                          >
                            {currencies.map((curr) => (
                              <option key={curr} value={curr}>
                                {curr}
                              </option>
                            ))}
                          </Form.Select>
                          {expenseErrors.currency && (
                            <div className="invalid-feedback">Required</div>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={3}>
                        <Form.Group>
                          <Form.Label className="small fw-medium">
                            Receipt
                          </Form.Label>
                          <Form.Control
                            type="file"
                            name="receiptFile"
                            onChange={handleReceiptUpload}
                            className={`rounded-2 ${
                              expenseErrors.receiptFile ? "is-invalid" : ""
                            }`}
                            accept="image/*,.pdf"
                          />
                          {expenseErrors.receiptFile && (
                            <div className="invalid-feedback">Required</div>
                          )}
                          {expenseItem.receiptFile && (
                            <small className="text-success d-block mt-1">
                              {expenseItem.receiptFile.name}
                            </small>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="text-end mt-3">
                      <Button variant="primary" onClick={handleAddExpense}>
                        + Add Expense
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Expense List */}
                {tripExpenseDetails.expenses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle table-hover border">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Category</th>
                          <th>Description</th>
                          <th className="text-end">Amount</th>
                          <th>Currency</th>
                          <th>Receipt</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripExpenseDetails.expenses.map((item) => (
                          <tr key={item.id}>
                            <td>
                              {new Date(item.expenseDate).toLocaleDateString()}
                            </td>
                            <td>{item.category}</td>
                            <td>{item.description}</td>
                            <td className="text-end">
                              {(Math.ceil(item.amount * 100) / 100).toFixed(2)}
                            </td>
                            <td>{item.currency}</td>
                            <td>
                              {item.receiptFile ? (
                                <span className="text-success small">
                                  {item.receiptFile.name}
                                </span>
                              ) : (
                                <span className="text-danger small">
                                  Missing
                                </span>
                              )}
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveExpense(item.id)}
                              >
                                ✕
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-secondary fw-bold">
                          <td colSpan={3} className="text-end">
                            Total:
                          </td>
                          <td className="text-end">
                            {(
                              Math.ceil(
                                tripExpenseDetails.expenses.reduce(
                                  (sum, item) => sum + item.amount,
                                  0
                                ) * 100
                              ) / 100
                            ).toFixed(2)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No expenses added yet
                  </div>
                )}
              </div>
            )}
          </div>
        </Card.Body>

        <Card.Footer className="bg-light py-3">
          <div className="d-flex justify-content-between">
            <div>
              {activeTab !== "details" && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setActiveTab("details")}
                >
                  Back to Details
                </Button>
              )}
            </div>
            <div>
              {activeTab === "details" ? (
                <Button
                  variant="primary"
                  onClick={() => handleTabChange("expenses")}
                >
                  Continue to Expenses
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={loading || tripExpenseDetails.expenses.length === 0}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      <span className="ms-2">Submitting...</span>
                    </>
                  ) : (
                    "Submit Expense Report"
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default TravelExpenseForm;
