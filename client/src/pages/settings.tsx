import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, FileText, Bell, Zap, Database, Settings as SettingsIcon,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";

interface ProcessingSettings {
  maxEmailsPerRun: number;
  dateRangeDays: number;
  saveAsEml: boolean;
  saveAsMsg: boolean;
  saveAsTxt: boolean;
  saveAsXml: boolean;
  markAsRead: boolean;
  moveToFolder: boolean;
  targetFolder: string;
  deleteAfterProcessing: boolean;
  autoReply: boolean;
  autoReplyMessage: string;
  autoForward: boolean;
  forwardToAddress: string;
  slackWebhookUrl: string;
  teamsWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<ProcessingSettings>({
    defaultValues: {
      maxEmailsPerRun: 50,
      dateRangeDays: 7,
      saveAsEml: false,
      saveAsMsg: false,
      saveAsTxt: false,
      saveAsXml: false,
      markAsRead: false,
      moveToFolder: false,
      targetFolder: "",
      deleteAfterProcessing: false,
      autoReply: false,
      autoReplyMessage: "",
      autoForward: false,
      forwardToAddress: "",
      slackWebhookUrl: "",
      teamsWebhookUrl: "",
      telegramBotToken: "",
      telegramChatId: "",
    },
  });

  // Check Office 365 connection
  const { data: connectionStatus, isLoading: connectionLoading } = useQuery<{connected: boolean, error?: string}>({
    queryKey: ['/api/office365/test'],
    refetchInterval: 30000,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: ProcessingSettings) => {
      return await apiRequest('POST', '/api/settings', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProcessingSettings) => {
    saveSettingsMutation.mutate(data);
  };

  return (
    <div className="flex-1 overflow-auto" data-testid="settings-page">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
            <p className="text-muted-foreground">
              Configure Email to PDF Converter - Inspired by Automatic Email Manager
            </p>
          </div>
          {connectionStatus && (
            <Badge 
              variant={connectionStatus.connected ? "default" : "destructive"}
              className="flex items-center gap-2"
              data-testid="connection-status"
            >
              {connectionStatus.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Office 365 Connected
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Not Connected
                </>
              )}
            </Badge>
          )}
        </div>
      </header>

      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general" data-testid="tab-general">
                <SettingsIcon className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="export" data-testid="tab-export">
                <FileText className="w-4 h-4 mr-2" />
                Export Formats
              </TabsTrigger>
              <TabsTrigger value="actions" data-testid="tab-actions">
                <Mail className="w-4 h-4 mr-2" />
                Email Actions
              </TabsTrigger>
              <TabsTrigger value="automation" data-testid="tab-automation">
                <Zap className="w-4 h-4 mr-2" />
                Automation
              </TabsTrigger>
              <TabsTrigger value="notifications" data-testid="tab-notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="office365" data-testid="tab-office365">
                <Database className="w-4 h-4 mr-2" />
                Office 365
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Settings</CardTitle>
                  <CardDescription>
                    Configure how many emails to process and date range
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxEmailsPerRun">Max Emails Per Run</Label>
                      <Input
                        id="maxEmailsPerRun"
                        type="number"
                        {...register("maxEmailsPerRun", { valueAsNumber: true })}
                        data-testid="input-max-emails"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateRangeDays">Date Range (Days)</Label>
                      <Input
                        id="dateRangeDays"
                        type="number"
                        {...register("dateRangeDays", { valueAsNumber: true })}
                        data-testid="input-date-range"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Formats */}
            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Formats</CardTitle>
                  <CardDescription>
                    Choose additional file formats to save emails (similar to Automatic Email Manager)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveAsEml" 
                      {...register("saveAsEml")}
                      data-testid="checkbox-save-eml"
                    />
                    <Label htmlFor="saveAsEml" className="font-normal">
                      Save as EML (Email Message Format - RFC 822)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveAsMsg" 
                      {...register("saveAsMsg")}
                      data-testid="checkbox-save-msg"
                    />
                    <Label htmlFor="saveAsMsg" className="font-normal">
                      Save as MSG (Outlook Message Format)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveAsTxt" 
                      {...register("saveAsTxt")}
                      data-testid="checkbox-save-txt"
                    />
                    <Label htmlFor="saveAsTxt" className="font-normal">
                      Save as TXT (Plain Text)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="saveAsXml" 
                      {...register("saveAsXml")}
                      data-testid="checkbox-save-xml"
                    />
                    <Label htmlFor="saveAsXml" className="font-normal">
                      Save as XML (Structured Data)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Actions */}
            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Email Actions</CardTitle>
                  <CardDescription>
                    Organize your mailbox after processing (similar to Automatic Email Manager)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="markAsRead" 
                      {...register("markAsRead")}
                      data-testid="checkbox-mark-read"
                    />
                    <Label htmlFor="markAsRead" className="font-normal">
                      Mark emails as read after processing
                    </Label>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="moveToFolder" 
                        {...register("moveToFolder")}
                        data-testid="checkbox-move-folder"
                      />
                      <Label htmlFor="moveToFolder" className="font-normal">
                        Move processed emails to folder
                      </Label>
                    </div>
                    {watch("moveToFolder") && (
                      <Input
                        placeholder="e.g., Processed, Archive"
                        {...register("targetFolder")}
                        data-testid="input-target-folder"
                      />
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="deleteAfterProcessing" 
                      {...register("deleteAfterProcessing")}
                      data-testid="checkbox-delete"
                    />
                    <Label htmlFor="deleteAfterProcessing" className="font-normal text-destructive">
                      Delete emails after processing (use with caution!)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation */}
            <TabsContent value="automation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Reply</CardTitle>
                  <CardDescription>
                    Automatically reply to processed emails
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoReply" 
                      {...register("autoReply")}
                      data-testid="checkbox-auto-reply"
                    />
                    <Label htmlFor="autoReply" className="font-normal">
                      Enable auto-reply
                    </Label>
                  </div>
                  {watch("autoReply") && (
                    <Textarea
                      placeholder="Your auto-reply message..."
                      {...register("autoReplyMessage")}
                      rows={4}
                      data-testid="textarea-auto-reply"
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Auto-Forward</CardTitle>
                  <CardDescription>
                    Forward processed emails to another address
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autoForward" 
                      {...register("autoForward")}
                      data-testid="checkbox-auto-forward"
                    />
                    <Label htmlFor="autoForward" className="font-normal">
                      Enable auto-forward
                    </Label>
                  </div>
                  {watch("autoForward") && (
                    <Input
                      type="email"
                      placeholder="forward@example.com"
                      {...register("forwardToAddress")}
                      data-testid="input-forward-address"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Slack Integration</CardTitle>
                  <CardDescription>
                    Receive notifications in Slack (similar to Automatic Email Manager)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="https://hooks.slack.com/services/..."
                    {...register("slackWebhookUrl")}
                    data-testid="input-slack-webhook"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Microsoft Teams Integration</CardTitle>
                  <CardDescription>
                    Receive notifications in Teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="https://outlook.office.com/webhook/..."
                    {...register("teamsWebhookUrl")}
                    data-testid="input-teams-webhook"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Telegram Integration</CardTitle>
                  <CardDescription>
                    Receive notifications via Telegram
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="telegramBotToken">Bot Token</Label>
                    <Input
                      id="telegramBotToken"
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      {...register("telegramBotToken")}
                      data-testid="input-telegram-token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegramChatId">Chat ID</Label>
                    <Input
                      id="telegramChatId"
                      placeholder="123456789"
                      {...register("telegramChatId")}
                      data-testid="input-telegram-chat"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Office 365 */}
            <TabsContent value="office365" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Office 365 Configuration</CardTitle>
                  <CardDescription>
                    Configure Microsoft Graph API credentials to access Office 365 mailboxes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium">Connection Status:</p>
                    {connectionLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Checking connection...</span>
                      </div>
                    ) : connectionStatus?.connected ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">Connected to Office 365</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Not Connected - Demo Mode Active</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      To connect to Office 365, you need to configure the following environment variables:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>MICROSOFT_CLIENT_ID</li>
                      <li>MICROSOFT_CLIENT_SECRET</li>
                      <li>MICROSOFT_TENANT_ID</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      These credentials can be obtained from the Azure Portal by registering an application
                      with Microsoft Graph API permissions for Mail.Read and Mail.ReadWrite.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6">
            <Button 
              type="submit" 
              disabled={saveSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {saveSettingsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
