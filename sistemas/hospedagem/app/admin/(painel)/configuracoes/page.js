import { getAdmin } from '@/lib/supabase/server';
import { loadSettings } from '@/lib/settings';
import { saveSettings } from '../../actions';
import { ActionForm, ListEditor } from '@/components/admin/ui';

const PERK_ICONS = [['tag', 'Etiqueta'], ['chat', 'Conversa'], ['gift', 'Presente'], ['shield', 'Escudo'], ['star', 'Estrela'], ['home', 'Casa']];

export default async function Configuracoes() {
  const { supabase } = await getAdmin();
  const s = await loadSettings(supabase);

  return (
    <>
      <header className="admin__head">
        <div>
          <p className="eyebrow">Configurações</p>
          <h1 className="admin__title">Personalização e regras</h1>
        </div>
        <a className="btn btn--ghost btn--sm" href="/" target="_blank" rel="noopener noreferrer">Ver site</a>
      </header>

      <ActionForm action={saveSettings} className="admin-form settings" submitLabel="Salvar configurações">
        <section className="panel">
          <h2 className="panel__title">Identidade</h2>
          <div className="grid3">
            <label className="field">Nome do negócio<input name="brand.name" required defaultValue={s.brand.name} /></label>
            <label className="field">Subtítulo<input name="brand.tagline" defaultValue={s.brand.tagline} /></label>
            <label className="field">Região<input name="brand.region" defaultValue={s.brand.region} placeholder="Litoral Norte da Bahia" /></label>
          </div>
          <h3 className="panel__sub">Cores</h3>
          <div className="grid3">
            <label className="field">Cor principal<input type="color" name="theme.primary" defaultValue={s.theme.primary} /></label>
            <label className="field">Cor de destaque<input type="color" name="theme.accent" defaultValue={s.theme.accent} /></label>
            <label className="field">Fundo<input type="color" name="theme.background" defaultValue={s.theme.background} /></label>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Destaque do topo</h2>
          <div className="grid2">
            <label className="field">Linha acima do título<input name="hero.eyebrow" defaultValue={s.hero.eyebrow} /></label>
            <label className="field">Selo<input name="hero.badge" defaultValue={s.hero.badge} /></label>
          </div>
          <label className="field">Título <small>(use **palavras** para destacar)</small><input name="hero.title" defaultValue={s.hero.title} /></label>
          <label className="field">Texto<textarea name="hero.text" rows={2} defaultValue={s.hero.text} /></label>
          <label className="field">Link da foto de fundo<input name="hero.photo" type="url" defaultValue={s.hero.photo} placeholder="https://…" /></label>
          <h3 className="panel__sub">Números</h3>
          <ListEditor name="hero.stats" initial={s.hero.stats} addLabel="Adicionar número" fields={[{ key: 'value', label: 'Valor' }, { key: 'label', label: 'Rótulo' }]} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Reserva e pagamento (Pix)</h2>
          <div className="grid3">
            <label className="field">Sinal (%)<input name="booking.depositPercent" type="number" min={0} max={100} defaultValue={s.booking.depositPercent} /></label>
            <label className="field">Prazo para pagar (horas)<input name="booking.holdHours" type="number" min={1} max={168} defaultValue={s.booking.holdHours} /></label>
            <label className="field">Taxa das plataformas (%) <small>(para mostrar a economia)</small><input name="booking.platformFee" type="number" min={0} max={50} defaultValue={s.booking.platformFee} /></label>
          </div>
          <div className="grid2">
            <label className="field">Horário de check-in<input name="booking.checkInTime" defaultValue={s.booking.checkInTime} /></label>
            <label className="field">Horário de check-out<input name="booking.checkOutTime" defaultValue={s.booking.checkOutTime} /></label>
          </div>
          <div className="grid2">
            <label className="field">Chave Pix<input name="booking.pixKey" defaultValue={s.booking.pixKey} placeholder="CPF, CNPJ, e-mail, telefone ou aleatória" /></label>
            <label className="field">Nome do recebedor<input name="booking.pixName" defaultValue={s.booking.pixName} /></label>
          </div>
          <div className="grid2">
            <label className="field">Cidade do recebedor<input name="booking.pixCity" defaultValue={s.booking.pixCity} placeholder="Salvador" /></label>
            <label className="field">Banco <small>(opcional)</small><input name="booking.pixBank" defaultValue={s.booking.pixBank} /></label>
          </div>
          <p className="panel__hint">Com chave e nome preenchidos, a página da reserva mostra um QR Code Pix com o valor do sinal já preenchido. Telefone como chave: use +55 e DDD (ex.: +5571999999999).</p>
          <label className="field">Condições da reserva <small>(o hóspede aceita antes de reservar)</small><textarea name="booking.terms" rows={3} defaultValue={s.booking.terms} /></label>
        </section>

        <section className="panel">
          <h2 className="panel__title">Contato</h2>
          <div className="grid2">
            <label className="field">WhatsApp (com DDD)<input name="contact.whatsapp" defaultValue={s.contact.whatsapp} placeholder="5571999999999" /></label>
            <label className="field">Instagram<input name="contact.instagram" defaultValue={s.contact.instagram} placeholder="@suapagina" /></label>
          </div>
          <div className="grid2">
            <label className="field">Perfil no Airbnb <small>(opcional)</small><input name="contact.airbnb" type="url" defaultValue={s.contact.airbnb} /></label>
            <label className="field">Endereço ou região<input name="contact.address" defaultValue={s.contact.address} /></label>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel__title">Por que reservar direto?</h2>
          <ListEditor name="perks" initial={s.perks} addLabel="Adicionar vantagem" fields={[{ key: 'icon', label: 'Ícone', type: 'select', options: PERK_ICONS }, { key: 'title', label: 'Título' }, { key: 'text', label: 'Texto' }]} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Depoimentos</h2>
          <ListEditor name="testimonials" initial={s.testimonials} addLabel="Adicionar depoimento" fields={[{ key: 'quote', label: 'Depoimento', type: 'textarea' }, { key: 'name', label: 'Nome' }, { key: 'origin', label: 'Cidade · casa' }]} />
        </section>

        <section className="panel">
          <h2 className="panel__title">Perguntas frequentes</h2>
          <ListEditor name="faq" initial={s.faq} addLabel="Adicionar pergunta" fields={[{ key: 'q', label: 'Pergunta' }, { key: 'a', label: 'Resposta', type: 'textarea' }]} />
        </section>

        <section className="panel">
          <label className="check"><input type="checkbox" name="demo" defaultChecked={s.demo} /><span>Modo demonstração (mostra aviso no rodapé de que o conteúdo é ilustrativo)</span></label>
        </section>
      </ActionForm>
    </>
  );
}
