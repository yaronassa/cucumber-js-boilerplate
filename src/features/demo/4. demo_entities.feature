Feature: Entities management
  The infrastructure includes built in data and entity management flows.
  This feature demonstrates these capabilities

  Scenario: Basic entity creation, validation and enumeration
    When I create a new User entity with: name = Demo user, role = admin
    When I create a new User entity with: name = Demo user 2, role = admin
    And I create a new Record entity with: price = 500, user = 0
    Then User entity #1 has fields: name = Demo user, role = ${/Admin/i}
    Then The last User entity has fields: name = Demo user 2, role = admin

  Scenario: Using stored entities information as variables
    When I create a new User entity with: name = Demo user, role = admin
    And I create a new Record entity with: price = 500, user = ${createdEntities_User_#1.id}
    Then Record entity #1 has fields: price = 500, user = 0
    