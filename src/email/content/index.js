const contentSendEmail = (email, content, note, favicon_url) => {
    return `
            <table style="width: 100%">
                <div
                    style="
                        box-sizing: border-box;
                        color: #0a0a0a;
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 1.3;
                        margin: 0;
                        min-width: 100%;
                        padding: 0;
                        text-align: left;
                        width: 100% !important;
                        font-family: Helvetica, Arial, sans-serif;
                        background-color: #cccc;
                    "
                >
                    <table
                        style="border-collapse: collapse; border-spacing: 0; height: 100%; vertical-align: top; width: 100%"
                    >
                        <tbody>
                            <tr>
                                <td
                                    align="center"
                                    valign="top"
                                    style="border-collapse: collapse !important; vertical-align: top; word-wrap: break-word"
                                >
                                    <center style="min-width: 580px; width: 100%">
                                        <table
                                            align="center"
                                            style="
                                                background: #fefefe;
                                                border-bottom: 3px solid #b2d600;
                                                border-collapse: collapse;
                                                border-spacing: 0;
                                                float: none;
                                                margin: 60px 40px;
                                                padding: 0;
                                                text-align: center;
                                                vertical-align: top;
                                                width: 580px;
                                            "
                                        >
                                            <tbody>
                                                <tr>
                                                    <th style="padding: 0 18px">
                                                        <center style="min-width: 532px; width: 100%; margin-top: 32px">
                                                            <img
                                                                src="${favicon_url}"
                                                                align="center"
                                                                style="
                                                                    clear: both;
                                                                    display: block;
                                                                    float: none;
                                                                    margin: 0 auto;
                                                                    max-width: 100%;
                                                                    outline: 0;
                                                                    text-align: center;
                                                                    text-decoration: none;
                                                                    width: 44px;
                                                                "
                                                                data-bit="iit"
                                                                tabindex="0"
                                                                alt="Netcode"
                                                            />
                                                        </center>
                                                        <h3
                                                            style="
                                                                color: inherit;
                                                                font-size: 28px;
                                                                font-weight: 600;
                                                                margin: 16px 0 32px 0;
                                                                text-align: center;
                                                                word-wrap: normal;
                                                            "
                                                        >
                                                            Netcode
                                                        </h3>
                                                        <p
                                                            style="
                                                                font-size: 14px;
                                                                line-height: 24px;
                                                                margin-bottom: 10px;
                                                                font-weight: 400;
                                                                text-align: left;
                                                                margin-top: 0;
                                                            "
                                                        >
                                                            Kính chào quý khách: ${email}
                                                        </p>
                                                        <center style="min-width: 532px; width: 100%">
                                                            <div align="center">
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        margin-bottom: 6px;
                                                                        font-weight: 400;
                                                                        text-align: left;
                                                                        margin-top: 10px;
                                                                    "
                                                                >
                                                                    ${content}
                                                                </p>
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        margin-bottom: 6px;
                                                                        font-weight: 400;
                                                                        text-align: left;
                                                                        margin-top: 10px;
                                                                    "
                                                                >
                                                                   <em>Lưu ý: ${note}</em>
                                                                </p>
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        margin-bottom: 10px;
                                                                        text-align: left;
                                                                        font-weight: 400;
                                                                    "
                                                                >
                                                                    Nếu quý khách có bất kỳ câu hỏi hoặc thắc mắc nào hãy liên hệ
                                                                    với chúng tôi qua hòm thư:
                                                                    <a
                                                                        href="mailto:noreply@netcode.vn"
                                                                        style="color: #00aa9d; text-decoration: none"
                                                                        target="_blank"
                                                                        >noreply@netcode.vn</a
                                                                    >
                                                                </p>
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        text-align: left;
                                                                        font-weight: 400;
                                                                        margin-top: 14px;
                                                                    "
                                                                >
                                                                    Trân trọng!
                                                                </p>
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        margin-bottom: 10px;
                                                                        text-align: left;
                                                                        font-weight: 400;
                                                                        margin-top: 10px;
                                                                    "
                                                                >
                                                                    Đội ngũ phát triển
                                                                </p>
                                                                <p
                                                                    style="
                                                                        font-size: 14px;
                                                                        line-height: 24px;
                                                                        color: #757575;
                                                                        text-align: left;
                                                                        font-weight: 400;
                                                                        margin-top: 42px;
                                                                    "
                                                                >
                                                                    <i
                                                                        >Đây là email được tạo tự động. Vui lòng không trả
                                                                        lời thư này.</i
                                                                    >
                                                                </p>
                                                            </div>
                                                        </center>
                                                    </th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </center>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </table>`;
};

export default contentSendEmail;
