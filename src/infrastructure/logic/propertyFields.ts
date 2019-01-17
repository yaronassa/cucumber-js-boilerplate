interface IPropertyField {
    fieldName: string,
    fieldValue: any,
    compareType?: 'like' | 'in'
}

class PropertyFields extends Array<IPropertyField> {
    constructor(fields: IPropertyField[]) {
        super();
        const clonedFields = [].concat(fields).map(field => ({fieldName: field.fieldName, fieldValue: field.fieldValue}));
        clonedFields.forEach(field => { if (field.fieldName !== undefined) this.push(field); });
    }

    public toString(delimiter: string = ', ') {
        return [].concat(this).map(field => {
            const value = (typeof field.fieldValue === "string") ? field.fieldValue : JSON.stringify(field.fieldValue);
            return `${field.fieldName}=${value}`;
        }).join(delimiter);
    }

    public getField(fieldName: string | RegExp, defaultValue?: any): IPropertyField {
        const nameTest = (typeof fieldName === 'string') ? new RegExp(`^ *${fieldName.trim()} *$`, 'i') : fieldName;
        const resultField = this.find(field => nameTest.test(field.fieldName));
        if (arguments.length === 1) return resultField;
        return resultField || {fieldName: fieldName.toString(), fieldValue: defaultValue};
    }

    public removeField(fieldName: string | RegExp): IPropertyField {
        const nameTest = (typeof fieldName === 'string') ? new RegExp(`^ *${fieldName.trim()} *$`, 'i') : fieldName;
        const fieldIndex = this.findIndex(field => nameTest.test(field.fieldName));
        if (fieldIndex > -1) return this.splice(fieldIndex, 1).pop();
    }

    public clone(): PropertyFields {
        return new PropertyFields([].concat(this));
    }

    public removeByValue(valueToRemove: string): PropertyFields {
        const removed: IPropertyField[] = [];
        let index = 0;
        while (index < this.length) {
            if (this[index].fieldValue === valueToRemove) {
                removed.push(this.splice(index, 1).pop());
            } else {
                index = index + 1;
            }
        }

        return new PropertyFields(removed);
    }

    public push(item: IPropertyField | IPropertyField[]): number {
        const items = Array.isArray(item) ? item : [item];
        items.forEach(newItem => super.push(newItem));
        return this.length;
    }

    public filter(filterFunction: (field: IPropertyField, index?: number, array?: IPropertyField[]) => boolean): PropertyFields {
        const filteredFields = super.filter(filterFunction);
        return new PropertyFields(filteredFields);
    }

}

export {IPropertyField, PropertyFields};
