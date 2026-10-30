import { getPainel } from '@/lib/supabase/server';
import { salvarConfiguracoes } from '../../actions';
import { Retorno } from '@/components/Atendimento';
import { OPCOES_PRAZO, OPCOES_SINAL, PADRAO_SINAL, sinalDoStudio } from '@/lib/configuracoes';

// Configurações do studio. Por enquanto: se o agendamento pelo site exige sinal (e quanto).
export const metadata = { title: 'Configurações · Painel do studio' };

export default async function ConfiguracoesPage({ searchParams }) {
  const sp = await searchParams;
  const { studio } = await getPainel();
  const sinal = sinalDoStudio(studio);
  // Desligado, mostra a última porcentagem usada, para religar igual.
  const pct = sinal.exige ? sinal.pct : Number(studio.settings?.ultimoSinal ?? PADRAO_SINAL);

  return (
    <>
      <h1 className="titulo">Configurações</h1>
      <p className="muted">Regras do agendamento pelo seu site.</p>
      <Retorno sp={sp} />

      <form action={salvarConfiguracoes} className="card form config">
        <input type="hidden" name="voltar" value="/configuracoes" />
        <h2 className="subtitulo">Sinal</h2>
        <label className="check config__chave">
          <input type="checkbox" name="exige" value="1" defaultChecked={sinal.exige} />
          <span>
            <strong>Exigir sinal para agendar</strong>
            <small>
              Ligado: o cliente paga o sinal pelo Pix e o horário fica segurado até você confirmar. Desligado: o
              agendamento já entra confirmado na agenda, sem Pix (comum em barbearias).
            </small>
          </span>
        </label>
        <div className="form__linha config__sinal">
          <label className="campo">
            Valor do sinal
            <select name="pct" defaultValue={String(pct)}>
              {OPCOES_SINAL.map((n) => (
                <option key={n} value={n}>{n === 100 ? 'Valor inteiro (100%)' : `${n}% do serviço`}</option>
              ))}
            </select>
          </label>
          <label className="campo">
            Prazo para pagar
            <select name="prazo" defaultValue={String(sinal.prazo)}>
              {OPCOES_PRAZO.map((o) => (
                <option key={o.min} value={o.min}>{o.nome}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="muted config__nota">
          Sem sinal, o financeiro conta o valor inteiro do atendimento quando você marca “Realizado”, e as faltas não
          entram no caixa. Agendamentos que já estão aguardando sinal continuam lá até você confirmar ou cancelar.
        </p>
        <button className="btn btn--primario btn--bloco" type="submit">Salvar</button>
      </form>
    </>
  );
}
