const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const crypto = require('crypto');

const srcDir = path.resolve('src');
const indexCssPath = path.resolve('src/index.css');

// Find all JSX and CSS files
const jsxFiles = [];
const cssFiles = [];

function walk(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.resolve(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules')) {
            walk(fullPath);
        } else {
            if (file.endsWith('.jsx')) jsxFiles.push(fullPath);
            if (file.endsWith('.css')) cssFiles.push(fullPath);
        }
    });
}
walk(srcDir);

// 1. Merge all CSS files into index.css (except index.css itself)
let mergedCss = '';
let indexCssExists = fs.existsSync(indexCssPath);
if (indexCssExists) {
    mergedCss = fs.readFileSync(indexCssPath, 'utf8') + '\n\n/* Merged CSS Below */\n\n';
}

cssFiles.forEach(file => {
    if (file !== indexCssPath) {
        mergedCss += `/* --- Merged from ${path.basename(file)} --- */\n`;
        mergedCss += fs.readFileSync(file, 'utf8') + '\n\n';
        // Mark for deletion later
    }
});

const generatedClasses = new Map(); // css string -> class name

function toKebabCase(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

function processJsxFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // Quick skip if no styles and no CSS imports to save time
    if (!code.includes('style={{') && !code.includes('.css')) return false;

    let ast;
    try {
        const parser = require('@babel/parser');
        ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx'],
            attachComment: false
        });
    } catch (e) {
        console.error(`Failed to parse ${filePath}:`, e.message);
        return false;
    }

    let modified = false;

    babel.traverse(ast, {
        ImportDeclaration(path) {
            // Check if it's a CSS import
            if (path.node.source.value.endsWith('.css')) {
                // Keep index.css, replace others with index.css
                if (!path.node.source.value.includes('index.css')) {
                    const relativePath = path.node.source.value;
                    // Determine how many levels up to src
                    // For simplicity, just import standard CSS or remove it.
                    // Actually, if we merge everything to index.css, we only need to import index.css once in main.jsx
                    // So we can just safely remove local CSS imports!
                    if (!filePath.endsWith('main.jsx') && !filePath.endsWith('App.jsx')) {
                        path.remove();
                        modified = true;
                    }
                }
            }
        },
        JSXAttribute(attrPath) {
            if (attrPath.node.name.name !== 'style') return;

            const value = attrPath.node.value;
            if (value && value.type === 'JSXExpressionContainer' && value.expression.type === 'ObjectExpression') {
                const props = value.expression.properties;
                
                // Check if all properties are static string/numeric literals
                const isCompletelyStatic = props.every(p => {
                    return p.type === 'ObjectProperty' && 
                           (p.value.type === 'StringLiteral' || p.value.type === 'NumericLiteral' || p.value.type === 'BooleanLiteral');
                });

                if (isCompletelyStatic && props.length > 0) {
                    let cssBlock = '';
                    props.forEach(p => {
                        const key = p.key.name || p.key.value;
                        const kebabKey = toKebabCase(key);
                        let val = p.value.value;
                        if (typeof val === 'number' && key !== 'opacity' && key !== 'zIndex' && key !== 'fontWeight' && key !== 'flex') {
                            val = val + 'px';
                        }
                        cssBlock += `  ${kebabKey}: ${val};\n`;
                    });

                    // Generate or reuse class name
                    let className = generatedClasses.get(cssBlock);
                    if (!className) {
                        const hash = crypto.createHash('md5').update(cssBlock).digest('hex').substring(0, 6);
                        className = `ex-style-${hash}`;
                        generatedClasses.set(cssBlock, className);
                        mergedCss += `.${className} {\n${cssBlock}}\n\n`;
                    }

                    // We need to merge this class name into the existing className attribute, or create one.
                    // Finding existing className attribute:
                    const jsxElement = attrPath.parentPath;
                    let existingClassNameAttr = null;
                    jsxElement.get('attributes').forEach(p => {
                        if (p.node.name && p.node.name.name === 'className') {
                            existingClassNameAttr = p;
                        }
                    });

                    if (existingClassNameAttr) {
                        const clsValue = existingClassNameAttr.node.value;
                        if (clsValue.type === 'StringLiteral') {
                            existingClassNameAttr.node.value.value += ` ${className}`;
                        } else if (clsValue.type === 'JSXExpressionContainer') {
                            // It's a template literal or expression: className={`btn ${dynamic}`}
                            // Simplest: Wrap in a template literal or binary expression.
                            // But for safety, we just inject it into the expression if it's a template literal.
                            const expr = clsValue.expression;
                            if (expr.type === 'TemplateLiteral') {
                                expr.quasis[0].value.raw += ` ${className}`;
                                expr.quasis[0].value.cooked += ` ${className}`;
                            } else {
                                // Dynamic string like `active ? 'a' : 'b'` -> className={`ex-style-xxx ${active ? 'a' : 'b'}`}
                                const t = babel.types;
                                clsValue.expression = t.templateLiteral(
                                    [
                                        t.templateElement({ raw: `${className} `, cooked: `${className} ` }),
                                        t.templateElement({ raw: '', cooked: '' }, true)
                                    ],
                                    [expr]
                                );
                            }
                        }
                    } else {
                        // Create a new className attribute
                        const t = babel.types;
                        jsxElement.node.attributes.push(
                            t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(className))
                        );
                    }

                    // Remove the inline style attribute
                    attrPath.remove();
                    modified = true;
                }
            }
        }
    });

    if (modified) {
        const output = babel.transformFromAstSync(ast, code, {
            retainLines: false,
            compact: false,
            generatorOpts: { jsescOption: { minimal: true } }
        });
        fs.writeFileSync(filePath, output.code);
        return true;
    }
    return false;
}

let modifiedCount = 0;
jsxFiles.forEach(file => {
    if (processJsxFile(file)) {
        modifiedCount++;
    }
});

// Write merged CSS
fs.writeFileSync(indexCssPath, mergedCss);

// Delete all merged CSS files except index.css
cssFiles.forEach(file => {
    if (file !== indexCssPath) {
        fs.unlinkSync(file);
    }
});

console.log(`Extraction complete. Generated ${generatedClasses.size} utility classes.`);
console.log(`Modified ${modifiedCount} JSX files.`);
console.log(`Deleted ${cssFiles.length - (indexCssExists ? 1 : 0)} CSS files.`);
