export class TagBuilder {
    constructor(tagName, tagParent) {
        this.tagName = tagName;
        this.tagParent = tagParent;
    }
    setParent(tagParent) {
        this.tagParent = tagParent;
        return this;
    }
    setClass(className) {
        this.className = className;
        return this;
    }
    setTextContent(textContent) {
        this.textContent = textContent;
        return this;
    }
    setValueContent(valueContent) {
        this.valueContent = valueContent;
        return this;
    }
    setAttribute(attributeName, attributeValue) {
        this.attributeName = attributeName;
        this.attributeValue = attributeValue || true;
        return this;
    }
    build(tagParent) {
        const tag = document.createElement(this.tagName);
        if (tagParent) {
            tagParent.appendChild(tag);
        } else if (this.tagParent) {
            this.tagParent.appendChild(tag);
        }
        if (this.className) {
            tag.className = this.className;
        }
        if (this.textContent != null) {
            tag.textContent = this.textContent;
        }
        if (this.valueContent != null) {
            tag.value = this.valueContent;
        }
        if (this.attributeName) {
            tag.setAttribute(this.attributeName, this.attributeValue);
        }
        return tag;
    }
}
