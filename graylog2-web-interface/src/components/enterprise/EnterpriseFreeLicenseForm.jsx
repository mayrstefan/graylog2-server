import React from 'react';
import PropTypes from 'prop-types';

import { Spinner } from 'components/common';
import { Button, ButtonToolbar, Col, Row } from 'components/graylog';
import { Input } from 'components/bootstrap';
import lodash from 'lodash';

const FORM_FIELDS = ['firstName', 'lastName', 'email', 'company'];

export default class EnterpriseFreeLicenseForm extends React.Component {
  static propTypes = {
    clusterId: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    clusterId: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      formFields: {
        firstName: '',
        lastName: '',
        email: '',
        company: '',
      },
      isSubmitting: false,
    };
  }

  clearValues = (callback) => {
    const clearedFields = FORM_FIELDS.reduce((acc, key) => Object.assign(acc, { [key]: '' }), {});
    this.setState({ formFields: clearedFields }, callback);
  };

  handleInput = (key) => {
    return (event) => {
      const { formFields } = this.state;
      const newFormFields = Object.assign(formFields, { [key]: lodash.trim(event.target.value) });
      this.setState({ formFields: newFormFields });
    };
  };

  formIsInvalid = () => {
    const { clusterId } = this.props;
    const { isSubmitting, formFields } = this.state;

    return !clusterId
      || isSubmitting
      || !lodash.isEmpty(FORM_FIELDS.filter((key) => lodash.isEmpty(lodash.trim(formFields[key]))));
  };

  submitForm = (event) => {
    event.preventDefault();

    const { clusterId, onSubmit } = this.props;
    const { formFields } = this.state;

    // First set "submitting" status to make sure we disable the submit button (avoid double-click)
    this.setState({ isSubmitting: true }, () => {
      onSubmit(clusterId, formFields, () => {
        // Clear form before unsetting "submitting" status, again, to avoid double-click
        this.clearValues(() => {
          this.setState({ isSubmitting: false });
        });
      });
    });
  };

  resetForm = () => {
    this.clearValues();
  };

  render() {
    const { clusterId } = this.props;
    const { formFields: { firstName, lastName, company, email } } = this.state;

    if (!clusterId) {
      return <Spinner text="Loading node information..." />;
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2 style={{ marginBottom: 10 }}>Graylog Enterprise is free for under 5 GB/day</h2>
          <form onSubmit={this.submitForm}>
            <Row>
              <Col md={5}>
                <h3 style={{ marginBottom: 10 }}>Get your free Graylog Enterprise license:</h3>
                <Input type="text"
                       id="firstName"
                       label="First Name"
                       value={firstName}
                       required
                       onChange={this.handleInput('firstName')} />
                <Input type="text"
                       id="lastName"
                       label="Last Name"
                       value={lastName}
                       required
                       onChange={this.handleInput('lastName')} />
                <Input type="text"
                       id="company"
                       label="Company"
                       value={company}
                       required
                       onChange={this.handleInput('company')} />
                <Input type="email"
                       id="email"
                       label="Email Address"
                       value={email}
                       placeholder="Please provide a valid email address to send the license key to"
                       required
                       onChange={this.handleInput('email')} />
              </Col>
            </Row>
            <Row>
              <Col sm={11}>
                <ButtonToolbar>
                  <Button id="submit-entry"
                          disabled={this.formIsInvalid()}
                          type="submit"
                          bsSize="small"
                          bsStyle="primary">
                    Get your free license
                  </Button>
                  <Button id="clear-entry"
                          onClick={this.resetForm}
                          bsSize="small">
                    Clear form
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </form>
        </Col>
      </Row>
    );
  }
}
