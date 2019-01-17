@cucumberParameters
Feature: Run standard test steps to test cucumber parameters functionality

  Scenario: Property fields parameter
    Given I work with the property field parameter: a=b, c=d
    Then Eval code if ($.data.getScenarioEntity('propertyFieldsParameter', 'latest').entity.getField('a').fieldValue !== 'b') throw('Unexpected value');

  Scenario: Entity parameter
    Given I work with the property field parameter: a=b1, c=d1
    Given I work with the property field parameter: a=b2
    And I work with the entity parameter: this propertyFieldsParameter
    Then Eval code if ($.data.getScenarioEntity('entityParameter', 'latest').entity.getField('a').fieldValue !== 'b2') throw('Unexpected value');
    And I work with the entity parameter: propertyFieldsParameter #2
    Then Eval code if ($.data.getScenarioEntity('entityParameter', 'latest').entity.getField('a').fieldValue !== 'b2') throw('Unexpected value');
    And I work with the entity parameter: propertyFieldsParameter #1
    Then Eval code if ($.data.getScenarioEntity('entityParameter', 'latest').entity.getField('a').fieldValue !== 'b1') throw('Unexpected value');