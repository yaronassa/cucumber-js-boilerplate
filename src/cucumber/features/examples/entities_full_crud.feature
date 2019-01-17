@demo
Feature: Entities full CRUD cycle
  This feature shows entity retrieval, validation and manipulation scenarios.
  The entities are based on the MetaWeather API (https://www.metaweather.com/api/) and the JSON placeholder API (https://jsonplaceholder.typicode.com/)

  Scenario: Entity creation id usage
    When I create a demo entity with fields: some=thing
    And I work with a demo entity with fields: id = ${entities_demo_entity_#1.entity.id}
    Then This demo entity has fields: some = thing

  Scenario: Basic entity creation
    Given I work with a demo entity with fields: some=thing
    Then This demo entity doesn't exist
    When I create a demo entity with fields: some=thing
    And I work with a demo entity with fields: some=thing
    Then This demo entity exist

  Scenario: Basic entity update and refresh
    When I create a demo entity with fields: some=thing
    And I work with a demo entity with fields: some=thing
    When I update this demo entity with fields: some2=thing2
    And I refresh this demo entity from the test environment
    Then This demo entity has fields: some2=thing2, some = thing

  Scenario: Basic entity deletion
    When I create a demo entity with fields: some=thing
    And I work with a demo entity with fields: some=thing
    And I delete this demo entity
    And I refresh this demo entity from the test environment
    Then This demo entity doesn't exist

    @skipRevert
  Scenario: Keep created entities part 1 of 2
      When I create a demo entity with fields: some=thing
      And I set the global variable entityID to ${this_demo_entity.id}
      
  Scenario: Keep created entities part 2 of 2
    And I work with a demo entity with fields: id = ${global_entityID}
    Then This demo entity has fields: some = thing
    And I delete this demo entity