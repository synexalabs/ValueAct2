/**
 * PDF Report Generation Service
 * Generates client-side PDF reports for IFRS 17 and Solvency II calculations
 * using jsPDF — no server round-trip required.
 */

import { jsPDF } from 'jspdf';

const EUR = (v) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
    : '—';

const PCT = (v) =>
  typeof v === 'number' ? `${(v * 100).toFixed(2)} %` : '—';

const NOW = () =>
  new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

function header(doc, title) {
  doc.setFillColor(15, 23, 42); // trust-950
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ValueAct Rechner', 12, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(title, 12, 17.5);
  doc.text(NOW(), 198, 12, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function footer(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      'Hinweis: Diese Berechnungen dienen ausschließlich Informationszwecken. Kein Ersatz für aufsichtsrechtliche Beratung.',
      12, 291
    );
    doc.text(`Seite ${i} / ${pages}`, 198, 291, { align: 'right' });
    doc.setTextColor(0);
  }
}

function section(doc, title, y) {
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(10, y, 190, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(title, 12, y + 5);
  doc.setFont('helvetica', 'normal');
  return y + 10;
}

function row(doc, label, value, y, highlight = false) {
  if (highlight) {
    doc.setFillColor(248, 250, 252);
    doc.rect(10, y - 4, 190, 6, 'F');
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', highlight ? 'bold' : 'normal');
  doc.text(label, 12, y);
  doc.text(value, 198, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  return y + 7;
}

export function exportIFRS17Report(results, inputs, assumptions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  header(doc, 'IFRS 17 Berechnungsbericht');

  let y = 25;

  y = section(doc, 'Vertragliche Servicemarge (CSM)', y);
  const isOnerous = (results.lossComponent || 0) > 0;
  y = row(doc, 'Bewertungsstatus', isOnerous ? 'Belastender Vertrag' : 'Profitabler Vertrag', y, true);
  y = row(doc, 'CSM (Contractual Service Margin)', EUR(results.csm), y, true);
  y = row(doc, 'Verlustkomponente (Loss Component)', EUR(results.lossComponent), y);
  y = row(doc, 'Erfüllungszahlungsströme (FCF)', EUR(results.fcf), y);
  y += 4;

  y = section(doc, 'Cashflow-Analyse', y);
  y = row(doc, 'Barwert der Prämien (PV Premiums)', EUR(results.pvPremiums), y);
  y = row(doc, 'Barwert der Leistungen (PV Benefits)', EUR(results.pvBenefits), y);
  y = row(doc, 'Barwert der Kosten (PV Expenses)', EUR(results.pvExpenses), y);
  y = row(doc, 'Risikoanpassung (Risk Adjustment)', EUR(results.ra), y);
  y += 4;

  y = section(doc, 'Eingabeparameter', y);
  if (inputs) {
    y = row(doc, 'Versicherungsart', inputs.policyType || '—', y);
    y = row(doc, 'Versicherungssumme', EUR(inputs.faceAmount), y);
    y = row(doc, 'Jahresprämie', EUR(inputs.premium), y);
    y = row(doc, 'Eintrittsalter', `${inputs.issueAge} Jahre`, y);
    y = row(doc, 'Laufzeit', `${inputs.policyTerm} Jahre`, y);
  }
  y += 4;

  y = section(doc, 'Berechnungsannahmen', y);
  if (assumptions) {
    y = row(doc, 'Diskontierungssatz', PCT(assumptions.discountRate), y);
    y = row(doc, 'Sterbetafel', assumptions.mortalityTable || '—', y);
    y = row(doc, 'Stornoquote', PCT(assumptions.lapseRate), y);
    y = row(doc, 'Kostenzuschlag', PCT(assumptions.expenseLoading), y);
    y = row(doc, 'Kosteninflation', PCT(assumptions.expenseInflation), y);
    y = row(doc, 'RA-Methode', assumptions.raMethod || 'factor', y);
  }
  y += 4;

  // CSM runoff chart as text table
  if (results.csmRunoff && results.csmRunoff.length > 0) {
    y = section(doc, 'CSM-Abwicklungsmuster (erste 10 Jahre)', y);
    results.csmRunoff.slice(0, 10).forEach((v, i) => {
      y = row(doc, `Jahr ${i + 1}`, EUR(v), y);
    });
  }

  footer(doc);
  doc.save(`ValueAct_IFRS17_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportSolvencyReport(results, inputs, assumptions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  header(doc, 'Solvency II SCR Berechnungsbericht');

  let y = 25;

  y = section(doc, 'Kapitalanforderungen', y);
  y = row(doc, 'Solvenzkapitalanforderung (SCR)', EUR(results.scr), y, true);
  y = row(doc, 'Mindestkapitalanforderung (MCR)', EUR(results.mcr), y, true);
  y = row(doc, 'Basis-SCR (BSCR)', EUR(results.bscr), y);
  y = row(doc, 'Betriebsrisiko', EUR(results.opRisk), y);
  y = row(doc, 'Solvenzquote', PCT(results.solvencyRatio), y, true);
  y = row(doc, 'Diversifikationsvorteil', EUR(results.diversification), y);
  y += 4;

  if (results.riskModules) {
    y = section(doc, 'Risikomodule (SCR-Aufschlüsselung)', y);
    y = row(doc, 'Marktrisiko', EUR(results.riskModules.marketRisk), y);
    y = row(doc, 'Lebensversicherungsrisiko', EUR(results.riskModules.lifeUW), y);
    y = row(doc, 'Gegenparteiausfallrisiko', EUR(results.riskModules.counterparty), y);
    y = row(doc, 'Betriebsrisiko', EUR(results.riskModules.opRisk), y);
    y += 4;
  }

  y = section(doc, 'Berechnungsannahmen', y);
  if (assumptions) {
    y = row(doc, 'Laufzeit (Jahre)', String(assumptions.policyTerm || inputs?.policyTerm || '—'), y);
    y = row(doc, 'Sterbetafel', assumptions.mortalityTable || '—', y);
  }

  y += 4;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('Berechnung gemäß Solvency-II-Standardformel (Delegierte Verordnung (EU) 2015/35)', 12, y);

  footer(doc);
  doc.save(`ValueAct_SolvencyII_${new Date().toISOString().slice(0, 10)}.pdf`);
}
