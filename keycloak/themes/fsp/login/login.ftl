<#import "template.ftl" as layout>
<script>document.title = "Вход ФСП ID";</script>
<@layout.registrationLayout displayInfo=social.displayInfo; section>
    <#if section = "header">
        <div class="login-header">
            <div class="logo-container">
                    <img src="${url.resourcesPath}/images/logo.svg" alt=" FSP Logo" class="logo-img" />
            </div>
            <p class="login-subtitle">Вход в единую учетную запись Федерации Спортивного Программирования</p>
        </div>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <div class="form-group">
                        <label for="username" class="form-label">E-mail или имя пользователя</label>
                        <input tabindex="1" id="username" class="form-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" placeholder="E-mail или имя пользователя" />
                    </div>

                    <div class="form-group">
                        <label for="password" class="form-label">Пароль</label>
                        <input tabindex="2" id="password" class="form-input" name="password" type="password" autocomplete="off" placeholder="Пароль" />
                    </div>

                    <div class="form-options">
                        <#if realm.resetPasswordAllowed>
                            <a href="${url.loginResetCredentialsUrl}" class="forgot-link">Забыли пароль?</a>
                        </#if>
                    </div>

                    <div id="kc-form-buttons" class="form-buttons">
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        <input tabindex="4" class="btn-primary" name="login" id="kc-login" type="submit" value="Войти"/>
                    </div>

                    <#if realm.registrationAllowed && !registrationDisabled?? >
                        <div class="form-footer">
                            <a href="${url.registrationUrl}" class="register-link">Регистрация</a>
                        </div>
                    </#if>
                </form>


            <!-- Кнопки быстрого входа (только в dev-режиме) -->
                <div class="quick-login">
                    <div class="quick-login-title">⚡ Быстрый вход (тестовые данные)</div>
                    <div class="quick-login-buttons">
                        <button type="button" class="quick-btn quick-btn-candidate " onclick="fillAndSubmit('candidat', 'password123')">
                            <span class="quick-btn-icon">👤</span>
                            <span class="quick-btn-text">Кандидат</span>
                        </button>
                        <button type="button" class="quick-btn quick-btn-employer" onclick="fillAndSubmit('employer', 'password123')">
                            <span class="quick-btn-icon">🏢</span>
                            <span class="quick-btn-text">Работодатель</span>
                        </button>
                        <button type="button" class="quick-btn quick-btn-admin" onclick="fillAndSubmit('admin', 'password123')">
                            <span class="quick-btn-icon">️✨</span>
                            <span class="quick-btn-text">Админ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function fillAndSubmit(username, password) {
                var usernameField = document.getElementById('username');
                var passwordField = document.getElementById('password');
                var loginButton = document.getElementById('kc-login');

                if (usernameField && passwordField) {
                    usernameField.value = username;
                    passwordField.value = password;

                    // Визуальная обратная связь
                    usernameField.style.borderColor = '#402FFF';
                    passwordField.style.borderColor = '#402FFF';

                    
                }
            }
        </script>
    </#if>
</@layout.registrationLayout>