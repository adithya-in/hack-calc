(function () {
    'use strict';

    function fmt(n) {
        if (!isFinite(n)) return 'Error';
        if (n === 0) return '0';
        var abs = Math.abs(n);
        if (abs >= 1e12 || abs < 1e-9) return n.toExponential(6).replace(/\.?0+e/, 'e');
        var s = String(parseFloat(n.toPrecision(12)));
        return s;
    }

    function tokenize(input) {
        var tokens = [];
        var i = 0;
        while (i < input.length) {
            var ch = input[i];
            if (/\s/.test(ch)) { i++; continue; }
            if (/[0-9.]/.test(ch)) {
                var num = '';
                while (i < input.length && /[0-9.]/.test(input[i])) { num += input[i++]; }
                if ((num.match(/\./g) || []).length > 1) throw new Error('Bad number');
                tokens.push({ t: 'num', v: parseFloat(num) });
                continue;
            }
            if (/[a-zA-Z]/.test(ch)) {
                var name = '';
                while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) { name += input[i++]; }
                tokens.push({ t: 'id', v: name.toLowerCase() });
                continue;
            }
            if ('+-*/^%()'.indexOf(ch) !== -1) {
                tokens.push({ t: 'op', v: ch });
                i++;
                continue;
            }
            throw new Error('Unexpected character');
        }
        return tokens;
    }

    function evaluate(input, deg) {
        var tokens = tokenize(input);
        var pos = 0;

        function peek() { return tokens[pos]; }
        function next() { return tokens[pos++]; }
        function expect(v) {
            var tok = next();
            if (!tok || tok.v !== v) throw new Error('Expected ' + v);
            return tok;
        }

        var toRad = deg ? Math.PI / 180 : 1;
        var fromRad = deg ? 180 / Math.PI : 1;

        var consts = { pi: Math.PI, e: Math.E };

        var funcs = {
            sin: function (x) { return Math.sin(x * toRad); },
            cos: function (x) { return Math.cos(x * toRad); },
            tan: function (x) { return Math.tan(x * toRad); },
            asin: function (x) { return Math.asin(x) * fromRad; },
            acos: function (x) { return Math.acos(x) * fromRad; },
            atan: function (x) { return Math.atan(x) * fromRad; },
            sqrt: Math.sqrt,
            log: function (x) { return Math.log(x) / Math.LN10; },
            ln: Math.log,
            abs: Math.abs,
            exp: Math.exp,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round
        };

        function parseExpr() {
            var value = parseTerm();
            while (peek() && peek().t === 'op' && (peek().v === '+' || peek().v === '-')) {
                var op = next().v;
                var rhs = parseTerm();
                value = op === '+' ? value + rhs : value - rhs;
            }
            return value;
        }

        function parseTerm() {
            var value = parseUnary();
            while (peek() && peek().t === 'op' && (peek().v === '*' || peek().v === '/')) {
                var op = next().v;
                var rhs = parseUnary();
                value = op === '*' ? value * rhs : value / rhs;
            }
            return value;
        }

        function parseUnary() {
            var tok = peek();
            if (tok && tok.t === 'op' && (tok.v === '+' || tok.v === '-')) {
                next();
                var val = parseUnary();
                return tok.v === '-' ? -val : val;
            }
            return parsePower();
        }

        function parsePower() {
            var base = parsePostfix();
            if (peek() && peek().t === 'op' && peek().v === '^') {
                next();
                return Math.pow(base, parseUnary());
            }
            return base;
        }

        function parsePostfix() {
            var value = parsePrimary();
            while (peek() && peek().t === 'op' && peek().v === '%') {
                next();
                value = value / 100;
            }
            return value;
        }

        function parsePrimary() {
            var tok = next();
            if (!tok) throw new Error('Unexpected end');
            if (tok.t === 'num') return tok.v;
            if (tok.t === 'id') {
                if (Object.prototype.hasOwnProperty.call(consts, tok.v)) {
                    if (peek() && peek().v === '(') throw new Error('Not a function');
                    return consts[tok.v];
                }
                if (!funcs[tok.v]) throw new Error('Unknown name');
                expect('(');
                var arg = parseExpr();
                expect(')');
                return funcs[tok.v](arg);
            }
            if (tok.v === '(') {
                var inner = parseExpr();
                expect(')');
                return inner;
            }
            throw new Error('Unexpected token');
        }

        if (!tokens.length) throw new Error('Empty');
        var result = parseExpr();
        if (pos !== tokens.length) throw new Error('Trailing input');
        if (typeof result !== 'number' || isNaN(result)) throw new Error('Undefined');
        return result;
    }

    var expr = document.getElementById('calcExpr');
    var resultEl = document.getElementById('calcResult');
    var angleMode = document.getElementById('angleMode');

    function calc(showError) {
        var value = expr.value.trim();
        if (!value) { resultEl.textContent = '0'; return; }
        try {
            var out = evaluate(value, angleMode.value === 'deg');
            resultEl.textContent = fmt(out);
        } catch (err) {
            if (showError) resultEl.textContent = 'Error';
        }
    }

    function insert(text) {
        var start = expr.selectionStart || 0;
        var end = expr.selectionEnd || 0;
        expr.value = expr.value.slice(0, start) + text + expr.value.slice(end);
        expr.focus();
        expr.selectionStart = expr.selectionEnd = start + text.length;
        calc(false);
    }

    document.querySelectorAll('.calc-pad button').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var act = btn.getAttribute('data-act');
            if (act === 'clear') {
                expr.value = '';
                resultEl.textContent = '0';
                expr.focus();
            } else if (act === 'back') {
                var start = expr.selectionStart || 0;
                var end = expr.selectionEnd || 0;
                if (start === end && start > 0) {
                    expr.value = expr.value.slice(0, start - 1) + expr.value.slice(end);
                    expr.selectionStart = expr.selectionEnd = start - 1;
                } else {
                    expr.value = expr.value.slice(0, start) + expr.value.slice(end);
                    expr.selectionStart = expr.selectionEnd = start;
                }
                calc(false);
                expr.focus();
            } else if (act === 'eq') {
                calc(true);
            } else {
                insert(btn.getAttribute('data-ins'));
            }
        });
    });

    expr.addEventListener('input', function () { calc(false); });
    expr.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); calc(true); }
    });
    angleMode.addEventListener('change', function () { calc(false); });

    var units = {
        length: {
            label: 'Length',
            base: 'm',
            list: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 }
        },
        mass: {
            label: 'Mass',
            base: 'kg',
            list: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.45359237, oz: 0.028349523125 }
        },
        temp: {
            label: 'Temperature',
            list: { C: 1, F: 1, K: 1 }
        }
    };

    var convCat = document.getElementById('convCat');
    var convFrom = document.getElementById('convFrom');
    var convTo = document.getElementById('convTo');
    var convValue = document.getElementById('convValue');
    var convOut = document.getElementById('convOut');

    function fillUnits() {
        var cat = convCat.value;
        var keys = Object.keys(units[cat].list);
        convFrom.innerHTML = '';
        convTo.innerHTML = '';
        keys.forEach(function (k) {
            convFrom.add(new Option(k, k));
            convTo.add(new Option(k, k));
        });
        convFrom.value = keys[0];
        convTo.value = keys[1] || keys[0];
        convert();
    }

    function toBase(cat, value, unit) {
        if (cat === 'temp') {
            if (unit === 'C') return value;
            if (unit === 'F') return (value - 32) * 5 / 9;
            return value - 273.15;
        }
        return value * units[cat].list[unit];
    }

    function fromBase(cat, value, unit) {
        if (cat === 'temp') {
            if (unit === 'C') return value;
            if (unit === 'F') return value * 9 / 5 + 32;
            return value + 273.15;
        }
        return value / units[cat].list[unit];
    }

    function convert() {
        var cat = convCat.value;
        var v = parseFloat(convValue.value);
        if (isNaN(v)) { convOut.textContent = 'Enter a number'; return; }
        var res = fromBase(cat, toBase(cat, v, convFrom.value), convTo.value);
        convOut.textContent = fmt(v) + ' ' + convFrom.value + ' = ' + fmt(res) + ' ' + convTo.value;
    }

    convCat.addEventListener('change', fillUnits);
    convFrom.addEventListener('change', convert);
    convTo.addEventListener('change', convert);
    convValue.addEventListener('input', convert);
    document.getElementById('convBtn').addEventListener('click', convert);

    var qa = document.getElementById('qa');
    var qb = document.getElementById('qb');
    var qc = document.getElementById('qc');
    var quadOut = document.getElementById('quadOut');

    function solveQuad() {
        var a = parseFloat(qa.value);
        var b = parseFloat(qb.value);
        var c = parseFloat(qc.value);
        if (isNaN(a) || isNaN(b) || isNaN(c)) { quadOut.textContent = 'Enter a, b and c'; return; }

        if (a === 0) {
            if (b === 0) {
                quadOut.textContent = c === 0 ? 'Every x satisfies the equation' : 'No solution';
            } else {
                quadOut.textContent = 'Linear equation: x = ' + fmt(-c / b);
            }
            return;
        }

        var d = b * b - 4 * a * c;
        var vx = -b / (2 * a);
        var vy = a * vx * vx + b * vx + c;

        if (d === 0) {
            quadOut.innerHTML = 'x = ' + fmt(vx) + '<span class="sub">Discriminant 0, one repeated root. Vertex (' + fmt(vx) + ', ' + fmt(vy) + ').</span>';
        } else if (d > 0) {
            var r = Math.sqrt(d);
            var x1 = (-b + r) / (2 * a);
            var x2 = (-b - r) / (2 * a);
            quadOut.innerHTML = 'x = ' + fmt(x1) + ' or ' + fmt(x2) + '<span class="sub">Discriminant ' + fmt(d) + ', two real roots. Vertex (' + fmt(vx) + ', ' + fmt(vy) + ').</span>';
        } else {
            var im = Math.sqrt(-d) / (2 * a);
            quadOut.innerHTML = 'x = ' + fmt(vx) + ' ± ' + fmt(Math.abs(im)) + 'i<span class="sub">Discriminant ' + fmt(d) + ', complex roots. Vertex (' + fmt(vx) + ', ' + fmt(vy) + ').</span>';
        }
    }

    document.getElementById('quadBtn').addEventListener('click', solveQuad);
    [qa, qb, qc].forEach(function (el) {
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') solveQuad(); });
    });

    var pctMode = document.getElementById('pctMode');
    var px = document.getElementById('px');
    var py = document.getElementById('py');
    var pctOut = document.getElementById('pctOut');

    function percent() {
        var x = parseFloat(px.value);
        var y = parseFloat(py.value);
        if (isNaN(x) || isNaN(y)) { pctOut.textContent = 'Enter X and Y'; return; }
        var mode = pctMode.value;
        if (mode === 'of') {
            pctOut.textContent = fmt(x) + '% of ' + fmt(y) + ' = ' + fmt(x / 100 * y);
        } else if (mode === 'is') {
            if (y === 0) { pctOut.textContent = 'Y cannot be 0'; return; }
            pctOut.textContent = fmt(x) + ' is ' + fmt(x / y * 100) + '% of ' + fmt(y);
        } else {
            if (x === 0) { pctOut.textContent = 'X cannot be 0'; return; }
            var change = (y - x) / Math.abs(x) * 100;
            var word = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'no change';
            pctOut.textContent = fmt(Math.abs(change)) + '% ' + word + ' from ' + fmt(x) + ' to ' + fmt(y);
        }
    }

    document.getElementById('pctBtn').addEventListener('click', percent);
    [px, py].forEach(function (el) {
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter') percent(); });
    });
    pctMode.addEventListener('change', percent);

    var formulas = [
        ['Maths', 'Quadratic formula', 'x = (-b ± sqrt(b² - 4ac)) / 2a'],
        ['Maths', 'Discriminant', 'D = b² - 4ac'],
        ['Maths', 'Arithmetic progression, nth term', 'aₙ = a + (n - 1)d'],
        ['Maths', 'Arithmetic progression, sum', 'Sₙ = n/2 (2a + (n - 1)d)'],
        ['Maths', 'Geometric progression, nth term', 'aₙ = a rⁿ⁻¹'],
        ['Maths', 'Geometric progression, sum', 'Sₙ = a(1 - rⁿ) / (1 - r)'],
        ['Maths', 'Pythagorean identity', 'sin²θ + cos²θ = 1'],
        ['Maths', 'Sine rule', 'a / sin A = b / sin B = c / sin C'],
        ['Maths', 'Cosine rule', 'c² = a² + b² - 2ab cos C'],
        ['Maths', 'Triangle area', 'A = ½ ab sin C'],
        ['Maths', 'Circle area', 'A = πr²'],
        ['Maths', 'Sphere volume', 'V = 4/3 πr³'],
        ['Maths', 'Cylinder volume', 'V = πr²h'],
        ['Maths', 'Distance between points', 'd = sqrt((x₂ - x₁)² + (y₂ - y₁)²)'],
        ['Maths', 'Slope of a line', 'm = (y₂ - y₁) / (x₂ - x₁)'],
        ['Maths', 'Logarithm product rule', 'log(xy) = log x + log y'],
        ['Maths', 'Logarithm power rule', 'log(xⁿ) = n log x'],
        ['Maths', 'Compound interest', 'A = P(1 + r/n)^(nt)'],
        ['Maths', 'Simple interest', 'I = PRT / 100'],
        ['Physics', 'First equation of motion', 'v = u + at'],
        ['Physics', 'Second equation of motion', 's = ut + ½at²'],
        ['Physics', 'Third equation of motion', 'v² = u² + 2as'],
        ['Physics', "Newton's second law", 'F = ma'],
        ['Physics', 'Work', 'W = F s cos θ'],
        ['Physics', 'Kinetic energy', 'KE = ½mv²'],
        ['Physics', 'Potential energy', 'PE = mgh'],
        ['Physics', 'Power', 'P = W / t'],
        ['Physics', "Ohm's law", 'V = IR'],
        ['Physics', 'Electrical power', 'P = VI = I²R = V² / R'],
        ['Physics', 'Resistors in series', 'R = R₁ + R₂ + R₃'],
        ['Physics', 'Resistors in parallel', '1/R = 1/R₁ + 1/R₂ + 1/R₃'],
        ['Physics', 'Density', 'ρ = m / V'],
        ['Physics', 'Pressure', 'P = F / A'],
        ['Physics', 'Wave equation', 'v = fλ'],
        ['Physics', 'Lens formula', '1/f = 1/v - 1/u'],
        ['Physics', 'Ideal gas law', 'PV = nRT'],
        ['Chemistry', 'Moles from mass', 'n = m / M'],
        ['Chemistry', 'Molarity', 'M = n / V'],
        ['Chemistry', 'Dilution', 'M₁V₁ = M₂V₂'],
        ['Chemistry', 'pH', 'pH = -log[H⁺]'],
        ['Chemistry', 'Percentage yield', '(actual / theoretical) × 100'],
        ['Chemistry', 'Gibbs free energy', 'ΔG = ΔH - TΔS']
    ];

    var formulaList = document.getElementById('formulaList');
    var formulaEmpty = document.getElementById('formulaEmpty');
    var formulaSearch = document.getElementById('formulaSearch');

    function renderFormulas(query) {
        var q = (query || '').trim().toLowerCase();
        formulaList.innerHTML = '';
        var shown = 0;
        formulas.forEach(function (row) {
            var haystack = (row[0] + ' ' + row[1] + ' ' + row[2]).toLowerCase();
            if (q && haystack.indexOf(q) === -1) return;
            var li = document.createElement('li');
            li.className = 'formula-item';
            var strong = document.createElement('strong');
            strong.textContent = row[0] + ' · ' + row[1];
            var code = document.createElement('code');
            code.textContent = row[2];
            li.appendChild(strong);
            li.appendChild(code);
            formulaList.appendChild(li);
            shown++;
        });
        formulaEmpty.hidden = shown !== 0;
    }

    formulaSearch.addEventListener('input', function () { renderFormulas(formulaSearch.value); });

    fillUnits();
    renderFormulas('');
    calc(false);
    percent();
    solveQuad();
})();
