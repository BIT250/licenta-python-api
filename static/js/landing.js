window.addEventListener('DOMContentLoaded', () => {
  const forms = [
    {
      id: 'diabetesForm',
      endpoint: '/ai/predict_diabetes',
      resultEl: 'diabetesResult',
      fields: [
        'pregnancies','glucose','blood_pressure','skin_thickness',
        'insulin','bmi','diabetes_pedigree_function','age'
      ]
    },
    {
      id: 'heartForm',
      endpoint: '/ai/predict_heart_disease',
      resultEl: 'heartResult',
      fields: [
        'age_h','sex','cp','trestbps','chol','fbs',
        'restecg','thalach','exang','oldpeak','slope','ca','thal'
      ]
    }
  ];

  forms.forEach(cfg => {
    const form = document.getElementById(cfg.id);
    const resultP = document.getElementById(cfg.resultEl);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      // Colectează valorile
      const payload = {};
      cfg.fields.forEach(f => {
        payload[f] = +document.getElementById(f).value;
      });
      // Disable & feedback
      const btn = form.querySelector('button');
      btn.disabled = true;
      btn.textContent = 'Predicting...';

      try {
        const res = await fetch(cfg.endpoint, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const votes = Object.values(data).reduce((a,b)=>a+b,0);

        let msg, cls;
        if (votes === 0) { msg = 'Riscul foarte scăzut'; cls = 'success'; }
        else if (votes === cfg.fields.length/2) { /* nu* */ }
        else if (votes === Object.keys(data).length) { msg = 'Riscul foarte ridicat'; cls = 'error'; }
        else { msg = `Modele pozitive: ${votes}/${Object.keys(data).length}`; cls = 'warning'; }

        resultP.textContent = msg;
        resultP.className = `result ${cls}`;
      } catch (err) {
        console.error(err);
        resultP.textContent = 'Eroare la predicție';
        resultP.className = 'result error';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Predict';
      }
    });
  });
});
