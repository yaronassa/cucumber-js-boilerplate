import {AbstractEntityGetter} from "../abstractEntityGetter";
import {IDataEntity, IEntityType} from "../../../../logic/entities";
import {PropertyFields} from "../../../../logic/propertyFields";
import {IJSONPlaceholderAPIUser} from "../../../../testEnvironment/json/jsonPlaceholderAPI";

class UserEntityGetter extends AbstractEntityGetter {
    public async getEntity(entityType: IEntityType, fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IDataEntity> {
        switch (entityType.typeName) {
            case 'user':
                const userData = await this.getUserEntityData(fromEntity, matchFields);
                return this.constructEntity(userData, entityType, fromEntity, matchFields);

            case 'user_list':
                const userListData = await this.getUserListData(fromEntity, matchFields);
                return this.constructEntity(userListData, entityType, fromEntity, matchFields);

            default:
                throw new Error(`Unknown User entity type: ${entityType.typeName}`);
        }
    }

    private async getUserEntityData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IJSONPlaceholderAPIUser> {
        const userList = (fromEntity) ? fromEntity.entity : await this.getUserListData(fromEntity, matchFields);

        const filteredList = await this.infra.utils.filterArrayByProps(userList, matchFields);

        return filteredList.pop();
    }

    private async getUserListData(fromEntity: IDataEntity, matchFields: PropertyFields): Promise<IJSONPlaceholderAPIUser[]> {
        const result = await this.infra.testEnvironment.jsonPlaceholder.getUsers(matchFields);

        return result;
    }

}

export default UserEntityGetter;

