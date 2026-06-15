import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { useApprovalStore } from '@/store/useApprovalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface ApprovalFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApprovalFlowModal({ isOpen, onClose }: ApprovalFlowModalProps) {
  const selectedApprovalId = useApprovalStore((state) => state.selectedApprovalId);
  const approval = useApprovalStore((state) => state.getApprovalById(selectedApprovalId || ''));
  const approveLevel1 = useApprovalStore((state) => state.approveLevel1);
  const approveLevel2 = useApprovalStore((state) => state.approveLevel2);
  const approveLevel3 = useApprovalStore((state) => state.approveLevel3);
  const reject = useApprovalStore((state) => state.reject);
  const currentUser = useAuthStore((state) => state.currentUser);
  const [comment, setComment] = useState('');

  if (!approval) return null;

  const steps = [
    { level: 1, label: '巡护员初审', by: approval.level1By, at: approval.level1At, comment: approval.level1Comment, role: 'ranger' },
    { level: 2, label: '保护区主任复核', by: approval.level2By, at: approval.level2At, comment: approval.level2Comment, role: 'director' },
    { level: 3, label: '林业局终审', by: approval.level3By, at: approval.level3At, comment: approval.level3Comment, role: 'bureau' },
  ];

  const getCurrentStep = () => {
    if (approval.status === 'pending_level1') return 1;
    if (approval.status === 'pending_level2') return 2;
    if (approval.status === 'pending_level3') return 3;
    if (approval.status === 'approved') return 4;
    if (approval.status === 'rejected') return 0;
    return 0;
  };

  const currentStep = getCurrentStep();

  const canApprove = () => {
    if (!currentUser) return false;
    if (approval.status === 'pending_level1' && currentUser.role === 'ranger') return true;
    if (approval.status === 'pending_level2' && currentUser.role === 'director') return true;
    if (approval.status === 'pending_level3' && currentUser.role === 'bureau') return true;
    return false;
  };

  const handleApprove = () => {
    if (approval.status === 'pending_level1') {
      approveLevel1(approval.id, comment);
    } else if (approval.status === 'pending_level2') {
      approveLevel2(approval.id, comment);
    } else if (approval.status === 'pending_level3') {
      approveLevel3(approval.id, comment);
    }
    setComment('');
  };

  const handleReject = () => {
    const level = approval.status === 'pending_level1' ? 1 : approval.status === 'pending_level2' ? 2 : 3;
    reject(approval.id, level, comment);
    setComment('');
  };

  const formatTime = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getApprovalTypeText = (type: string) => {
    const map: Record<string, string> = {
      poaching: '偷猎事件',
      rescue: '救助方案',
      patrol: '巡护计划',
      drone_deployment: '无人机调度',
    };
    return map[type] || type;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="三级审批流程" size="lg">
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText size={28} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{approval.description}</h3>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    类型: <span className="text-white">{getApprovalTypeText(approval.type)}</span>
                  </span>
                  <span className="text-gray-400">
                    提交时间: <span className="text-white">{formatTime(approval.createdAt)}</span>
                  </span>
                </div>
                <div className="mt-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      approval.status === 'approved' && 'bg-green-500/20 text-green-400',
                      approval.status === 'rejected' && 'bg-red-500/20 text-red-400',
                      approval.status.startsWith('pending') && 'bg-yellow-500/20 text-yellow-400'
                    )}
                  >
                    {approval.status === 'approved' && '已通过'}
                    {approval.status === 'rejected' && '已否决'}
                    {approval.status === 'pending_level1' && '待初审'}
                    {approval.status === 'pending_level2' && '待复核'}
                    {approval.status === 'pending_level3' && '待终审'}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <span className="text-sm font-medium text-white">审批进度</span>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.level} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                      currentStep > step.level || approval.status === 'approved'
                        ? 'bg-green-500'
                        : currentStep === step.level
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-700'
                    )}
                  >
                    {currentStep > step.level || approval.status === 'approved' ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : approval.status === 'rejected' && currentStep === step.level ? (
                      <XCircle size={16} className="text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">{step.level}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-medium text-sm',
                          currentStep >= step.level || approval.status === 'approved'
                            ? 'text-white'
                            : 'text-gray-500'
                        )}
                      >
                        {step.label}
                      </span>
                      {step.by && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <User size={10} />
                          {step.by}
                        </span>
                      )}
                    </div>
                    {step.comment && (
                      <p className="mt-1 text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                        "{step.comment}"
                      </p>
                    )}
                    {step.at && (
                      <p className="mt-1 text-xs text-gray-500">{formatTime(step.at)}</p>
                    )}
                    {index < steps.length - 1 && (
                      <div className="mt-2 w-0.5 h-6 bg-gray-700 ml-[15px]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {canApprove() && (
          <Card>
            <Card.Header>
              <span className="text-sm font-medium text-white">填写审批意见</span>
            </Card.Header>
            <Card.Body>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请输入审批意见..."
                className="w-full h-24 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <div className="mt-4 flex gap-3">
                <Button variant="danger" className="flex-1" onClick={handleReject}>
                  <XCircle size={16} className="mr-2" />
                  否决
                </Button>
                <Button variant="success" className="flex-1" onClick={handleApprove}>
                  <CheckCircle size={16} className="mr-2" />
                  通过
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {approval.status === 'approved' && approval.chasePath && approval.chasePath.length > 0 && (
          <Card>
            <Card.Header>
              <span className="text-sm font-medium text-white">追捕路径</span>
            </Card.Header>
            <Card.Body>
              <div className="h-32 bg-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    <path
                      d="M 20 80 Q 60 20, 100 50 T 180 30"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                    <circle cx="20" cy="80" r="5" fill="#22c55e" />
                    <circle cx="180" cy="30" r="6" fill="#ef4444" className="animate-ping" />
                  </svg>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {!canApprove() && approval.status.startsWith('pending') && (
          <div className="text-center py-4 text-gray-400 text-sm">
            <Clock size={20} className="mx-auto mb-2 opacity-50" />
            您当前没有权限进行此级别的审批
          </div>
        )}

        <Button variant="secondary" className="w-full" onClick={onClose}>
          关闭
        </Button>
      </div>
    </Modal>
  );
}
