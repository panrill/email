/**
 * Templates module
 * Handles HTML template rendering
 */
const templates = {
  /**
   * Render a template with data
   * @param {string} templateId - ID of the template to render
   * @param {Object} data - Data to pass to the template
   * @returns {string} - Rendered HTML
   */
  render(templateId, data = {}) {
    // Get template content
    const template = document.getElementById(templateId);
    
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return '';
    }
    
    // Clone the template content
    const content = template.innerHTML;
    
    // Replace placeholders with data
    return content.replace(/\${(\w+)}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : '';
    });
  },
  
  /**
   * Render a list of items using a template
   * @param {string} templateId - ID of the template to render
   * @param {Array} items - Array of data items
   * @param {Function} keyFn - Function to generate a key for each item
   * @returns {string} - Rendered HTML
   */
  renderList(templateId, items, keyFn) {
    if (!items || items.length === 0) {
      return '';
    }
    
    return items.map(item => {
      const html = this.render(templateId, item);
      if (keyFn) {
        return `<div data-key="${keyFn(item)}">${html}</div>`;
      }
      return html;
    }).join('');
  },
  
  /**
   * Create an element from a template
   * @param {string} templateId - ID of the template to render
   * @param {Object} data - Data to pass to the template
   * @returns {HTMLElement} - Created element
   */
  createElement(templateId, data = {}) {
    const html = this.render(templateId, data);
    const temp = document.createElement('div');
    temp.innerHTML = html.trim();
    return temp.firstChild;
  },
  
  /**
   * Create multiple elements from a template
   * @param {string} templateId - ID of the template to render
   * @param {Array} items - Array of data items
   * @param {Function} keyFn - Function to generate a key for each item
   * @returns {DocumentFragment} - Document fragment with created elements
   */
  createElements(templateId, items, keyFn) {
    const fragment = document.createDocumentFragment();
    
    if (!items || items.length === 0) {
      return fragment;
    }
    
    items.forEach(item => {
      const element = this.createElement(templateId, item);
      if (keyFn) {
        element.dataset.key = keyFn(item);
      }
      fragment.appendChild(element);
    });
    
    return fragment;
  }
};
