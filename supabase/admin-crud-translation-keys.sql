-- Admin CRUD Translation Keys (English)
-- Phase 1: Admin Farmer, Farm, and Field Management
-- Total: 45 new keys for admin CRUD operations

-- Admin Farmer Management (12 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('admin.addFarmer', 'en', '+ Add Farmer', 'admin', 'Button to create new farmer'),
('admin.editFarmer', 'en', 'Edit', 'admin', 'Button to edit farmer details'),
('admin.createFarmerTitle', 'en', 'Add New Farmer', 'admin', 'Modal title for creating farmer'),
('admin.editFarmerTitle', 'en', 'Edit Farmer', 'admin', 'Modal title for editing farmer'),
('admin.farmerName', 'en', 'Name', 'admin', 'Form label for farmer name'),
('admin.farmerEmail', 'en', 'Email', 'admin', 'Form label for farmer email'),
('admin.farmerPhone', 'en', 'Phone', 'admin', 'Form label for farmer phone'),
('admin.billingAddressOptional', 'en', 'Billing Address (Optional)', 'admin', 'Section header for billing address'),
('admin.billingAddress', 'en', 'Billing Address', 'admin', 'Section header for billing address'),
('admin.createFarmerButton', 'en', 'Create Farmer', 'admin', 'Submit button for creating farmer'),
('admin.enterFarmerName', 'en', 'Please enter farmer name', 'admin', 'Validation message'),
('admin.enterValidEmail', 'en', 'Please enter a valid email', 'admin', 'Validation message');

-- Admin Farm Management (15 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('admin.addFarm', 'en', '+ Add Farm', 'admin', 'Button to create new farm'),
('admin.editFarm', 'en', 'Edit', 'admin', 'Button to edit farm'),
('admin.viewFields', 'en', 'View Fields', 'admin', 'Button to view farm fields'),
('admin.createFarmTitle', 'en', 'Add New Farm', 'admin', 'Modal title for creating farm'),
('admin.editFarmTitle', 'en', 'Edit Farm', 'admin', 'Modal title for editing farm'),
('admin.farmerOwner', 'en', 'Farmer Owner', 'admin', 'Form label for farm owner'),
('admin.selectFarmer', 'en', 'Select farmer...', 'admin', 'Dropdown placeholder for farmer selection'),
('admin.farmName', 'en', 'Farm Name', 'admin', 'Form label for farm name'),
('admin.alertBuffer', 'en', 'Alert Buffer (meters)', 'admin', 'Form label for alert buffer'),
('admin.alertBufferDescription', 'en', 'Distance outside field boundaries to receive alerts', 'admin', 'Help text for alert buffer'),
('admin.enableAlerts', 'en', 'Enable alerts for this farm', 'admin', 'Checkbox label for enabling alerts'),
('admin.addFieldsAfterCreation', 'en', 'You can add fields to this farm after creation', 'admin', 'Info message in farm creation'),
('admin.createFarmButton', 'en', 'Create Farm', 'admin', 'Submit button for creating farm'),
('admin.selectFarmerValidation', 'en', 'Please select a farmer', 'admin', 'Validation message'),
('admin.enterFarmName', 'en', 'Please enter farm name', 'admin', 'Validation message');

-- Admin Field Management (10 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('admin.addField', 'en', '+ Add Field', 'admin', 'Button to create new field'),
('admin.editField', 'en', 'Edit', 'admin', 'Button to edit field'),
('admin.deleteField', 'en', 'Delete', 'admin', 'Button to delete field'),
('admin.createFieldTitle', 'en', 'Add Field to {{farmName}}', 'admin', 'Modal title for creating field'),
('admin.editFieldTitle', 'en', 'Edit Field', 'admin', 'Modal title for editing field'),
('admin.fieldName', 'en', 'Field Name', 'admin', 'Form label for field name'),
('admin.sheepCountOptional', 'en', 'Sheep Count (Optional)', 'admin', 'Form label for sheep count'),
('admin.boundaryNotImplemented', 'en', 'Field boundary drawing not yet implemented. Default rectangle will be created.', 'admin', 'Warning message in field creation'),
('admin.createFieldButton', 'en', 'Create Field', 'admin', 'Submit button for creating field'),
('admin.enterFieldName', 'en', 'Please enter field name', 'admin', 'Validation message');

-- Admin Farm Details Modal (5 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('admin.farmDetailsOwner', 'en', 'Owner: {{ownerName}}', 'admin', 'Farm owner display'),
('admin.farmDetailsAlertBuffer', 'en', 'Alert Buffer:', 'admin', 'Label for alert buffer display'),
('admin.farmDetailsAlerts', 'en', 'Alerts:', 'admin', 'Label for alerts status'),
('admin.farmDetailsFields', 'en', 'Fields:', 'admin', 'Label for field count'),
('admin.farmDetailsCreated', 'en', 'Created:', 'admin', 'Label for creation date'),
('admin.noFieldsYet', 'en', 'No fields added yet', 'admin', 'Empty state for fields list'),
('admin.fencePosts', 'en', '{{count}} fence posts', 'admin', 'Display for fence post count');

-- Admin Report Management (3 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('admin.claimForFarmer', 'en', 'Claim for Farmer', 'admin', 'Button to claim report for a farmer'),
('admin.claimReportTitle', 'en', 'Claim Report for Farmer', 'admin', 'Modal title for claiming report'),
('admin.reportDetails', 'en', 'Report Details', 'admin', 'Section header for report information'),
('admin.selectFarmerToClaim', 'en', 'Select Farmer', 'admin', 'Form label for farmer selection'),
('admin.chooseFarmer', 'en', 'Choose farmer...', 'admin', 'Dropdown placeholder'),
('admin.claimNotification', 'en', 'This will mark the report as "claimed" and notify the walker that a farmer is responding.', 'admin', 'Info message about claim action'),
('admin.claimReportButton', 'en', 'Claim Report', 'admin', 'Submit button for claiming report');

-- Common Form Elements (10 keys)
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
('common.cancel', 'en', 'Cancel', 'common', 'Cancel button'),
('common.save', 'en', 'Save Changes', 'common', 'Save button'),
('common.close', 'en', 'Close', 'common', 'Close button'),
('common.delete', 'en', 'Delete', 'common', 'Delete button'),
('common.edit', 'en', 'Edit', 'common', 'Edit button'),
('common.create', 'en', 'Create', 'common', 'Create button'),
('common.required', 'en', '*', 'common', 'Required field indicator'),
('common.optional', 'en', '(Optional)', 'common', 'Optional field indicator'),
('common.addressLine1', 'en', 'Address Line 1', 'common', 'Form label'),
('common.addressLine2', 'en', 'Address Line 2', 'common', 'Form label'),
('common.city', 'en', 'City', 'common', 'Form label'),
('common.county', 'en', 'County', 'common', 'Form label'),
('common.postcode', 'en', 'Postcode', 'common', 'Form label');
