@demo
Feature: Variable handling
  These scenarios explore the possible variables the infrastructure offers

  Scenario: Working with this / entities variables
    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=Shanna@melissa.tv
    Then The variable ${this_json_user.name} equals Ervin Howell
    And The variable ${entities_json_user_1.name} equals Ervin Howell

  Scenario: Working with this / entities variables
    Given I work with the entire json user list
    And from this json user list, I work with the json user with fields: email=Shanna@melissa.tv
    Then The variable ${this_json_user.name} equals Ervin Howell
    And The variable ${entities_json_user_1.name} equals Ervin Howell

  Scenario: Working with math variables
    Given I work with the json user list with fields: email=Shanna@melissa.tv
    Then This json user list has fields: length = ${=_10 - 3*3}

  Scenario: Working with random variables
    Given I create a demo entity with fields: number = ${random_10_30}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: number = ${this_random}

  Scenario: Working with date variables - 1 of 2
    Given I create a demo entity with fields: date = ${date_13/12/2000_-5_days_+5_months_format_DD-MM-YY}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: date = 08-05-01

  Scenario: Working with date variables - 2 of 2
    Given I create a demo entity with fields: date = ${date_now_format_YYYY}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: date = 2019

  Scenario: Working with global variables - 1 of 2
    Given I set the global variable variableData to thing

  Scenario: Working with global variables - 2 of 2
    Given I create a demo entity with fields: data = ${global_variableData}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: data = thing

  Scenario: Working with regexp variables
    Given I create a demo entity with fields: number = ${random_10_99}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: number = ${/\d\d/}

  Scenario: Working with array variables
    Given I create a demo entity with fields: data = ${[a, b]}
    And I work with a demo entity with fields: id = ${this_demo_entity.id}
    Then This demo entity has fields: data.0 = a
