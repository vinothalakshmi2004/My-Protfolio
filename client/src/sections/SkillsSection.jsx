/**
 * SkillsSection — one card per skill category; each skill shows a technology
 * logo (explicit icon key or auto-detected from its name) and its level, if set.
 */
import { motion } from 'framer-motion';
import { FiCheck, FiCpu, FiDatabase, FiLayout, FiServer, FiTool, FiUsers, FiZap } from 'react-icons/fi';
import Section from '../components/Section';
import { getSkillIcon } from '../utils/icons';

/** Decorative category icon picked from keywords in the (owner-defined) category name. */
const categoryIcon = (category = '') => {
  const c = category.toLowerCase();
  if (/front|ui|web/.test(c)) return FiLayout;
  if (/back|server|api/.test(c)) return FiServer;
  if (/data|db/.test(c)) return FiDatabase;
  if (/\bai\b|ml|machine|automation/.test(c)) return FiCpu;
  if (/tool|devops|cloud/.test(c)) return FiTool;
  if (/soft|team|lead/.test(c)) return FiUsers;
  return FiZap;
};

export const SkillsSection = ({ skills = [], content, muted }) => (
  <Section id="skills" content={content} muted={muted}>
    {/* Mobile: 1 col, md: 2 cols, lg: 3 cols */}
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {skills.map((group, idx) => {
        const CategoryIcon = categoryIcon(group.category);
        return (
          <motion.div
            key={group._id || group.category}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (idx % 3) * 0.08 }}
            className="group min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10 dark:border-slate-800/80 dark:bg-slate-900 sm:p-7"
          >
            <div className="mb-5 flex items-center gap-3.5">
              <div className="bg-gradient-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-110">
                <CategoryIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white">{group.category}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {group.items?.length || 0} {group.items?.length === 1 ? 'skill' : 'skills'}
                </p>
              </div>
            </div>

            <ul className="flex flex-wrap gap-2">
              {(group.items || []).map((item) => {
                const Icon = getSkillIcon(item) || FiCheck;
                return (
                  <li
                    key={item._id || item.name}
                    title={item.level ? `${item.name} — ${item.level}` : item.name}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-xl border border-brand/15 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand/40 dark:bg-brand/10 dark:text-slate-200"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand dark:text-brand-light" aria-hidden="true" />
                    <span className="min-w-0 break-words">{item.name}</span>
                    {item.level && (
                      <span className="shrink-0 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {item.level}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}
    </div>
  </Section>
);

export default SkillsSection;
