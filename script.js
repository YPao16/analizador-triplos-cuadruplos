let tempCounter = 0;

function resetCounter() {
  tempCounter = 0;
}

function newTemp() {
  tempCounter++;
  return `t${tempCounter}`;
}

// Tokenizador básico para expresiones matemáticas simples
function tokenize(exp) {
  const tokens = [];
  let current = '';
  for (let i = 0; i < exp.length; i++) {
    const char = exp[i];
    if (['+', '-', '*', '/', '(', ')'].includes(char)) {
      if (current.trim()) tokens.push(current.trim());
      tokens.push(char);
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

// Convierte infija a posfija (Algoritmo Shunting-yard)
function infixToPostfix(tokens) {
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const output = [];
  const stack = [];

  tokens.forEach(token => {
    if (['+', '-', '*', '/'].includes(token)) {
      while (
        stack.length &&
        precedence[stack[stack.length - 1]] >= precedence[token]
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop();
    } else {
      output.push(token);
    }
  });

  while (stack.length) {
    output.push(stack.pop());
  }

  return output;
}

function procesar() {
  resetCounter();
  let rawExp = document.getElementById('expresion').value;
  rawExp = rawExp.replace(';', '').trim();

  if (!rawExp.includes('=')) {
    alert('Por favor ingresa una asignación válida (ej: x = a + b * c;)');
    return;
  }

  const parts = rawExp.split('=');
  const targetVar = parts[0].trim();
  const mathExp = parts[1].trim();

  const tokens = tokenize(mathExp);
  const postfix = infixToPostfix(tokens);

  const cuadruplos = [];
  const triplos = [];
  const stackCuad = [];
  const stackTrip = [];

  postfix.forEach(token => {
    if (['+', '-', '*', '/'].includes(token)) {
      const op2Cuad = stackCuad.pop();
      const op1Cuad = stackCuad.pop();
      const temp = newTemp();
      
      // Cuádruplo
      cuadruplos.push({ op: token, op1: op1Cuad, op2: op2Cuad, res: temp });
      stackCuad.push(temp);

      // Triplo
      const op2Trip = stackTrip.pop();
      const op1Trip = stackTrip.pop();
      const triIndex = triplos.length + 1;
      
      triplos.push({ op: token, op1: op1Trip, op2: op2Trip });
      stackTrip.push(`(${triIndex})`);
    } else {
      stackCuad.push(token);
      stackTrip.push(token);
    }
  });

  // Asignación final
  const finalCuadRes = stackCuad.pop();
  cuadruplos.push({ op: '=', op1: finalCuadRes, op2: '—', res: targetVar });

  const finalTripRes = stackTrip.pop();
  triplos.push({ op: '=', op1: targetVar, op2: finalTripRes });

  // Renderizar resultados en las tablas
  renderTablas(cuadruplos, triplos);
}

function reiniciarEntrada() {
  const input = document.getElementById('expresion');
  const tbodyCuad = document.querySelector('#tabla-cuadruplos tbody');
  const tbodyTrip = document.querySelector('#tabla-triplos tbody');
  const jsBox = document.getElementById('codigo-js');

  input.value = '';
  input.focus();

  tbodyCuad.innerHTML = '';
  tbodyTrip.innerHTML = '';
  jsBox.innerHTML = '';
}

function renderTablas(cuadruplos, triplos) {
  // Cuádruplos
  const tbodyCuad = document.querySelector('#tabla-cuadruplos tbody');
  tbodyCuad.innerHTML = '';
  cuadruplos.forEach((c, idx) => {
    tbodyCuad.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${c.op}</td>
        <td>${c.op1}</td>
        <td>${c.op2}</td>
        <td>${c.res}</td>
      </tr>
    `;
  });

  // Triplos
  const tbodyTrip = document.querySelector('#tabla-triplos tbody');
  tbodyTrip.innerHTML = '';
  triplos.forEach((t, idx) => {
    tbodyTrip.innerHTML += `
      <tr>
        <td>${idx + 1}</td>
        <td>${t.op}</td>
        <td>${t.op1}</td>
        <td>${t.op2}</td>
      </tr>
    `;
  });

  // Código JS equivalente con resaltado básico
  const jsBox = document.getElementById('codigo-js');
  let jsCodeHTML = '';
  cuadruplos.forEach(c => {
    if (c.op === '=') {
      jsCodeHTML += `<span class="keyword">let</span> <span class="variable">${c.res}</span> <span class="operator">=</span> <span class="variable">${c.op1}</span>;\n`;
    } else {
      jsCodeHTML += `<span class="keyword">let</span> <span class="variable">${c.res}</span> <span class="operator">=</span> <span class="variable">${c.op1}</span> ${c.op} <span class="variable">${c.op2}</span>;\n`;
    }
  });
  jsBox.innerHTML = jsCodeHTML;
}

// Ejecutar al cargar la página
window.onload = procesar;