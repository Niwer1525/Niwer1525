import { panelLayout } from '../../components/layout.js';
import { createPostModal } from '../../components/modals/create_post_modal.js';
import { editPostModal } from '../../components/modals/edit_post_modal.js';
import { jumpBar } from '../../components/nav.js';
import { translate } from '../../utils.js';

export async function render(lang, langDict) {
    const content = `
        ${jumpBar(langDict, 'Admin Sections', translate(langDict, 'jumpbar.panel.admin.title'), [
            { id: 'sql', label: translate(langDict, 'jumpbar.panel.sql') },
            { id: 'data-table', label: translate(langDict, 'jumpbar.panel.admin.data_table') },
            { id: 'blog-posts', label: translate(langDict, 'jumpbar.panel.admin.blog_posts') }
        ])}
        <section id="sql">
            <h2>${translate(langDict, 'title.sql')}</h2>
            <div class="section-actions">
                <button onclick="executeAdminSql()">
                    <i class="fa-solid fa-terminal"></i>
                    ${translate(langDict, 'btn.run_query')}
                </button>
            </div>
            <div class="flex-center-wrap">
                <textarea class="badge-card large-card" id="adminSql" rows="4" maxlength="2000" placeholder="SELECT * FROM Account LIMIT 10"></textarea>
                <textarea class="badge-card large-card" id="adminSqlResult" readonly placeholder="${translate(langDict, 'sql_placeholder_results')}"></textarea>
            </div>
        </section>
        <section id="data-table">
            <h2>${translate(langDict, 'title.tables')}</h2>
            <div class="section-actions">
                <select class="button" id="tableSelector" style="width: 190px;" onchange="loadTableData()"></select>
                <input class="button" type="number" id="tableLimit" value="100" style="width: 190px;" onchange="loadTableData()" title="${translate(langDict, 'btn.title.table_limit')}">
                <button onclick="loadTableData()" title="${translate(langDict, 'btn.title.refresh')}"><i class="fa-solid fa-rotate-right"></i></button>
            </div>
            <div class="table-container">
                <table id="dataTableEl">
                    <thead id="dataTableHead"><tr><th>${translate(langDict, 'sql.table.select_option')}</th></tr></thead>
                    <tbody id="dataTableBody"></tbody>
                </table>
            </div>
        </section>
        <section id="blog-posts">
            <h2>${translate(langDict, 'title.blog_posts')}</h2>
            <div class="section-actions">
                <button onclick="showPopup('create-post-popup')">
                    <i class="fa-solid fa-plus"></i>
                    ${translate(langDict, 'btn.create_post')}
                </button>
            </div>
            <div class="table-container">
                <table id="blogTable">
                    <thead>
                        <tr>
                            <th>${translate(langDict, 'blog.table_header.slug')}</th>
                            <th>${translate(langDict, 'blog.table_header.lang')}</th>
                            <th>${translate(langDict, 'blog.table_header.title')}</th>
                            <th>${translate(langDict, 'blog.table_header.summary')}</th>
                            <th>${translate(langDict, 'blog.table_header.status')}</th>
                            <th>${translate(langDict, 'blog.table_header.published_at')}</th>
                            <th>${translate(langDict, 'blog.table_header.created_at')}</th>
                            <th>${translate(langDict, 'blog.table_header.updated_at')}</th>
                            <th>${translate(langDict, 'blog.table_header.actions')}</th>
                        </tr>
                    </thead>
                    <tbody id="blogTableBody">
                         <tr>
                            <td colspan="5">${translate(langDict, "blog.loading")}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
        ${createPostModal(langDict)}
        ${editPostModal(langDict)}
    `;

    return panelLayout({
        page: 'admin',
        lang,
        langDict,
        title: 'Dashboard | Erwin Redoté',
        description: 'The dashboard for niwer.dev, where you can manage your account, view your purchases, and access exclusive content.',
        canonical: 'https://niwer.dev/panel.html',
        content,
        additionalScripts: [
            {
                file: '/js/panel.js',
                defer: true,
                type: 'module'
            },
			{
				file: '/js/panel/auth.js',
				defer: true,
                type: 'module'
			},
			{
				file: '/js/panel/admin.js',
				defer: true,
                type: 'module'
			}
        ]
    });
}